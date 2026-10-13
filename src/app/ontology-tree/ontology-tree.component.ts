import { Router, ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { NgControl } from "@angular/forms";
import { Subject, Observable } from "rxjs";
import {map, startWith} from 'rxjs/operators';
import { takeUntil, filter } from "rxjs/operators";
import * as d3 from "d3";

import *  as  ontology_data from './phase2b_moa_updated.json'
import { holdsCompounds } from './ontology-export';

// Tree palette - matches the legend in the template and the site's design tokens
const COLORS = {
  categoryFill: '#dbe4f7',
  categoryStroke: '#3d6de0',
  moa: '#1f8a5b',          // category whose children are compounds
  compoundFill: '#ffffff',
  compoundStroke: '#3d6de0',
  found: '#e5484d',        // search / hover path
  link: '#c9ced6',
  text: '#0f1b2d',
  textSoft: '#4a5568'
};
const FONT = '"IBM Plex Sans", "Lato", Arial, sans-serif';
const MONO = '"IBM Plex Mono", Consolas, monospace';


function nodeFill(d: any): string {
  if (d.class === 'found') { return COLORS.found; }
  if (holdsCompounds(d.data)) { return COLORS.moa; }
  if (d.data.children) { return COLORS.categoryFill; }
  return COLORS.compoundFill;
}

function nodeStroke(d: any): string {
  if (d.class === 'found') { return COLORS.found; }
  if (holdsCompounds(d.data)) { return COLORS.moa; }
  if (d.data.children) { return COLORS.categoryStroke; }
  return COLORS.compoundStroke;
}

// Number of distinct compounds (leaf nodes) under an ontology root
function countCompounds(node: any, seen: Set<string> = new Set()): number {
  const kids = node.children || [];
  if (!kids.length && node.inchikey) { seen.add(node.inchikey); }
  kids.forEach(k => countCompounds(k, seen));
  return seen.size;
}

@Component({
  selector: 'app-ontology-tree',
  templateUrl: './ontology-tree.component.html',
  styleUrls: ['./ontology-tree.component.scss']
})
export class OntologyTreeComponent implements OnInit, AfterViewInit {
  // The five ontology roots
  ontologies: Array<{ label: string; count: number }> = ((ontology_data as any).entities || [])
    .map(e => ({ label: e.preferred_name, count: countCompounds(e) }));

  // 'columns' (Finder-style browser, default) or 'tree' (d3 tree)
  view: 'columns' | 'tree' = 'columns';
  currentRoot: any;
  revealId: number = null;

  // Flat list of every node in the current ontology, for the search box
  searchIndex: Array<{ id: any; preferred_name: string; parent_name: string; lower: string }> = [];

  title = 'd3tree';
  @ViewChild('chart') private chartContainer: ElementRef;

  myControl = new FormControl();

  root: any;
  tree: any;
  treeLayout: any;
  svg: any;
  rightPanelStyle: any = {};


  treeData: any;

  height: number;
  width: number;
  margin: any = { top: 100, bottom: 100, left: 100, right: 100 };
  
  duration: number = 500;
  nodeWidth: number = 5;
  nodeHeight: number = 5;
  nodeRadius: number = 5;
  horizontalSeparationBetweenNodes: number = 5;
  verticalSeparationBetweenNodes: number = 5;
  nodeTextDistanceY: string = "-5px";
  nodeTextDistanceX: number = 5;

  dragStarted: boolean;
  draggingNode: any;
  nodes: any[];
  selectedNodeByDrag: any;

  selectedNodeByClick: any;
  previousClickedDomNode: any;
  links: any;

  element: any;

  constructor(private _route: ActivatedRoute, private _router: Router) { }
  ngOnInit() {}

  beep: any

ngAfterViewInit(): void {
  const src = this._route.snapshot.queryParams['src'];

  // ⬇️ If no source is provided, default to 0 (pharma_role)
  if (src === undefined) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { src: 0 },
      queryParamsHandling: 'merge'
    });
    return; // important so the rest runs AFTER redirect
  }

  this.view = this._route.snapshot.queryParams['view'] === 'tree' ? 'tree' : 'columns';
  const searchParam = parseInt(this._route.snapshot.queryParams['search_id']);
  // Defer so the bindings set here don't change during this check
  setTimeout(() => {
    // Apply any search from the URL first, so the first draw already shows it
    if (!isNaN(searchParam)) {
      this.search_id = searchParam;
      this.revealId = searchParam;
    }
    this.switch_ontology_source({ target: { name: src } });
    if (!isNaN(searchParam)) {
      this.myControl.setValue(searchParam, { emitEvent: false });
    }
  });
}

  setView(view: 'columns' | 'tree') {
    if (this.view === view) { return; }
    this.view = view;
    this._router.navigate([], { relativeTo: this._route, queryParams: { view }, queryParamsHandling: 'merge' });
    if (view === 'tree') {
      // The chart container has to be visible (sized) before d3 can draw into it
      setTimeout(() => this.drawTree());
    }
  }

  private drawTree() {
    d3.select('#content').remove();
    this.nameData_arr = [];
    this.renderTreeChart(this.currentRoot);
  }

  private buildSearchIndex(root: any) {
    const out = [];
    const walk = (node, parent) => {
      if (parent) {
        out.push({ id: node.id, preferred_name: node.preferred_name, parent_name: parent.preferred_name,
                   lower: String(node.preferred_name).toLowerCase() + ' ' + String(node.inchikey || '').toLowerCase() });
      }
      (node.children || []).forEach(k => walk(k, node));
    };
    walk(root, null);
    this.searchIndex = out;
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(v => {
        const q = typeof v === 'string' ? v.trim().toLowerCase() : '';
        if (q.length < 2) { return []; }
        return this.searchIndex.filter(o => o.lower.includes(q)).slice(0, 50);
      })
    );
  }

  onSearchSelected(id: any) {
    this.search_id = id;
    this.revealId = id;
    if (this.view === 'tree') {
      this.searchTree();
    } else {
      this.handle_url_params();
    }
  }


  @ViewChild('searchInput') searchInput: ElementRef;
  switch_ontology_source(event) { //function switches data source from button clicks\
    //this.searchInput.nativeElement.value = '';
    const changed = this.src != null && this.src != event.target.name;
    this.src = event.target.name;
    this.currentRoot = (ontology_data as any).entities[event.target.name];
    if (changed) {
      this.search_id = undefined;
      this.revealId = null;
      this.myControl.setValue('', { emitEvent: true });
    }
    this.buildSearchIndex(this.currentRoot);
    this.handle_url_params();
    if (this.view === 'tree') {
      this.drawTree();
    }

  }

  search_terms: string;
  search_id: number;
  src: number;
  nameData: Array<string> = [];
  nameData_arr: Array<{preferred_name: string, parent_name: string, id: string}> = [];  //array to hold the objects to pipe to the search dropdown
  filteredOptions: Observable<any[]>; //holds the filtered options

  getTitle(name_id: any) { // shows the selected node's name in the search box
    if (typeof name_id === 'string') { return name_id; }
    const result = this.searchIndex.find(o => o.id == name_id);
    return result ? result.preferred_name : '';
  }

  CollectName(d) {
    if (d.children) //check if the object has visible children
        d.children.forEach(element => this.CollectName(element)); //for each visible child, call collectName recursivley and check the visible child
    else if (d._children) //check if the node has hidden children
        d._children.forEach(element => this.CollectName(element));  //for each hidden child, call collectName recursivley and check the hidden child
    this.nameData.push(d.data.preferred_name);  //push the preferred_name field of the object to the nameData array

    //below populates the drop down search options
    if(d.parent){ //if the object has a parent (i.e. not the root node) push the created object containing name, parent name, and id to the nameData_arr to send to the search dropdown
      this.nameData_arr.push({preferred_name: d.data.preferred_name, parent_name: "--("+d.parent.data.preferred_name+")", id: d.data.id})
    }
  }
//===============================================
  remove_found(d) { //resets the found class of nodes
    delete d.class;
    if (d._children) {
        d._children.forEach(element => this.remove_found(element));
    } else if (d.children){
       d.children.forEach(element => this.remove_found(element));
    }
  }
//===============================================
  expandAll(d) {  //expands the entire tree
    if (d._children) {
        d.children = d._children;
        d.children.forEach(element => this.expandAll(element));
        d._children = null;
    } else if (d.children)
        d.children.forEach(element => this.expandAll(element));
}
//===============================================
  collapseAllNotFound(d) {  //hides all paths/nodes that are not of class "found"
    if (d.children) {
      if (d.class !== "found") {
        d._children = d.children;
        d._children.forEach(element => this.collapseAllNotFound(element));
        d.children = null;
      } else 
        d.children.forEach(element => this.collapseAllNotFound(element));
    }
  }
//===============================================
  handle_url_params(){
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {
        src: this.src,
        search_id: this.search_id || null
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }
  searchTree(){ //function handles calling all needed functions to execute a search
    this.handle_url_params();
    this.nameData_arr = [];       //1) reset the nameData_arr array
    this.remove_found(this.root)  //2) remove the found class from all objects
    this.CollectName(this.root)   //3) get names to repopulate the search dropdown
    this.expandAll(this.root)     //4) expand the whole tree
    this.checkFound(this.root);   //5) walk through all objects and mark found if it matches the search
    this.root.children.forEach(element => this.collapseAllNotFound(element)); //6)caollapse the nodes that are not along the path of the search result
    this.updateChart(this.root);  //7) refresh the chart
  }
  //===============================================
  checkFound(d) {
    if (d.children) //check if the object has visible children
        d.children.forEach(element => this.checkFound(element))
    else if (d._children) //check if the object has hidden children
        d._children.forEach(element => this.checkFound(element));

    if (d.data.id == this.search_id) {  //if the id of the object matches the id of the search, walk the parent chain and mark each object/node as found
      var ancestors = [];
      var parent = d;
      while (parent){
          ancestors.push(parent);
          parent.class = "found";
          parent = parent.parent;
      }
    }
}

  renderTreeChart(data) {

    let element: any = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    //zoom is an instance of the d3 zoom object, allws the g nodes to be moved within the svg by clicking or scrolling
    var zoom = d3.zoom().on('zoom', function() {
      d3.select('g.nodes_tree').attr('transform', d3.event.transform);
      //this.svg.attr("transform", d3.event.transform);
    });


    this.svg = d3.select(element).append("svg").attr("id", "content")
      .attr("width", element.offsetWidth) //+ margin.left + margin.right)
      .attr('height', element.offsetHeight)
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity.translate(this.width/3, this.height/2 +100).scale(0.93))
      .append("g")
      .attr("id", "chart4svg")
      .attr("class", "nodes_tree");

    //set an initial position
    d3.select('g.nodes_tree').call(zoom.transform, d3.zoomIdentity.translate(this.width/3, this.height/2 +100).scale(0.93));
      
    // declares a tree layout and assigns the size
    this.tree = d3.tree()
      .size([this.height, this.width])
      .nodeSize([this.nodeWidth + this.horizontalSeparationBetweenNodes, this.nodeHeight + this.verticalSeparationBetweenNodes])
      .separation((a, b) => { return a.parent == b.parent ? 5 : 10 });

    // Assigns parent, children, height, depth
    this.root = d3.hierarchy(data, (d) => { return d.children; });
    this.root.x0 = this.height / 2;
    this.root.y0 = 10;
    this.CollectName(this.root)
  
    // Collapse after the second level
    this.root.children.forEach(collapse);

    this.updateChart(this.root);

    function collapse(d) {
      if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
      }
    }

    if (this.search_id) {
      this.searchTree();
    }
  }

  click = (d) => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    if (d.parent) {
      d.parent.children.forEach(function(element) {
        if (d !== element) {
          collapse(element);
        }
      });
    }
    this.updateChart(d);
  }

  updateChart(source) {
    let i = 0;
    this.treeData = this.tree(this.root);
    this.nodes = this.treeData.descendants();
    this.links = this.treeData.descendants().slice(1);
    this.nodes.forEach((d) => { d.y = d.depth * 400 }); //the number in this line specifies pixel distance between nodes

    // let longest_name = 0
    // this.nodes.forEach((d) => { if(longest_name < d.data['preferred_name'].length){
    //   longest_name = d.data['preferred_name'].length
    // } });
    // this.nodes.forEach((d) => {d.longest_name = longest_name});
    // this.nodes.forEach((d) => { d.y = (d.depth * d.longest_name*10});

    let node = this.svg.selectAll('g.node')
      .data(this.nodes, (d) => { return d.data.id || (d.data.id = ++i); });

    let nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', this.click)
      .on('contextmenu', function(d){

        function d_to_csv(d: any){
          let parent_xref = `"${d.parent.data.xref.join(';').replace(/"/g, '\"')}"`;
          const csvString = [
            [
              "preferred name",
              'moa',
              'xref',
              "smiles",
              "inchikey",
              "reframe link"
            ],
            ... d.data.children.map(item => [
              `"${item.preferred_name.replace(/"/g, '\"')}"`,
              `"${item.moa.join(';').replace(/"/g, '\"')}"`,
              parent_xref,
              `"${item.smiles.replace(/"/g, '\"')}"`,
              `"${item.inchikey.replace(/"/g, '\"')}"`,
              '=HYPERLINK("https://reframedb.org//compound_data/'+item.inchikey.substring(0,14)+'")'
            ])
          ].map(e => e.join(",")) 
          .join("\n");

          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

          const link = document.createElement('a');
            if (link.download !== undefined) {
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', d.data.preferred_name);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            }
        }

        if(d.data.children[0].inchikey){
          d3.event.preventDefault();
          d_to_csv(d);
        }
      }) 

      
    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('id', function(d) {
        return "node" + d.data.id //for path highlight
      })
      .attr('r', 1e-6)
      .style('fill', nodeFill)
      .style('stroke', nodeStroke);

    nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => {
        return d.children || d._children ? -13 : 13;
      })
      .attr('text-anchor', (d) => {
        return d.children || d._children ? 'end' : 'start';
      })
      .style('font', `14px ${FONT}`)
      .style('fill', COLORS.text)
      // White halo so links passing behind a label don't cut through it
      .style('paint-order', 'stroke')
      .style('stroke', '#fff')
      .style('stroke-width', '4px')
      .style('stroke-linejoin', 'round')
      .text((d) => { return d.data.preferred_name; });

    function get_ikey(d){
      return d.data.inchikey;
    }
    nodeEnter.on("mouseover", function(d) {
      
      d3.select(this).classed("highlight", true);
          var g = d3.select(this); // The node
      if(d.data.inchikey){  //if the node has an ikey, show it
        var info = g.append('text')
        .classed('info', true)
        .attr('x', 20)
        .attr('y', 22)
        .style('font', `12px ${MONO}`)
        .style('fill', COLORS.textSoft)
        .style('paint-order', 'stroke')
        .style('stroke', '#fff')
        .style('stroke-width', '4px')
        .text("InChIKey " + d.data.inchikey.substring(0,14));
        g.on("click", function(d) {
          window.open("/" + "compound_data/" + get_ikey(d).substring(0,14));
        })
      }
      if(d.data.smiles){    //if the node has a smile, show it
        var info = g.append('text')
        .classed('info', true)
        .attr('x', 20)
        .attr('y', 40)
        .style('font', `12px ${MONO}`)
        .style('fill', COLORS.textSoft)
        .style('paint-order', 'stroke')
        .style('stroke', '#fff')
        .style('stroke-width', '4px')
        .text("SMILES " + d.data.smiles);
      }

      //code below handles highlighting paths to hovered nodes
      //("circle").style("fill", "pink");

      d3.selectAll('circle.node')
        .attr('r', 7)
        .style('stroke-width', '2px')
        .style('fill', nodeFill)
        .style('stroke', nodeStroke)
        .attr('cursor', 'pointer');

      d3.selectAll("path.link").style("stroke", COLORS.link);
      while (d.parent) {
        if("children" in d.data){
          if(!("inchikey" in d.data.children[0])){
            d3.selectAll("#node"+d.data.id).style("fill", COLORS.found).style("stroke", COLORS.found)
          }
        }else{
          d3.selectAll("#node"+d.data.id).style("fill", COLORS.found).style("stroke", COLORS.found)
        }
        if (d.parent != "null")
          d3.select("#link"+d.parent.data.id + "-" + d.data.id).style("stroke", COLORS.found)
        d = d.parent;
      }
    })

    .on("mouseout", function() {
      // Remove the info text on mouse out.
      d3.select(this).selectAll('text.info').remove();
    });

    let nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(this.duration)
      .attr('transform', (d) => {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    nodeUpdate.select('circle.node')
      .attr('r', 7)
      .style('stroke-width', '2px')
      .style('fill', nodeFill)
      .style('stroke', nodeStroke)
      .attr('cursor', 'pointer');

    let nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr('transform', (d) => {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    let link = this.svg.selectAll('path.link')
      .data(this.links, (d) => { return d.data.id; });
    

    let linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('id', function(d) {//for path highlight
         return "link" + d.parent.data.id + "-" + d.data.id //use ids to know what path leads where
      })
      .style('fill', 'none')

      .style('stroke-width', '1.5px')
      .style('stroke', COLORS.link)
      .attr('d', function (d) {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    let linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(this.duration)
      .style("stroke", function(d) {
        return d.class === "found" ? COLORS.found : COLORS.link;
      })
      .attr('d', (d) => { return diagonal(d, d.parent); });

    let linkExit = link.exit().transition()
      .duration(this.duration)
      .attr('d', function (d) {
        let o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    this.nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    function diagonal(s, d) { //creates the curved paths between parent and child nodes
      let path = `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
      return path;
    }
  }
}
