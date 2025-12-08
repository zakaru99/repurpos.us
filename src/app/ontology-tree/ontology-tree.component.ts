import { Router, ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { NgControl } from "@angular/forms";
import { Subject, Observable } from "rxjs";
import {map, startWith} from 'rxjs/operators';
import { takeUntil, filter } from "rxjs/operators";
import * as d3 from "d3";

import *  as  ontology_data from './phase2b_moa_updated.json'

@Component({
  selector: 'app-ontology-tree',
  templateUrl: './ontology-tree.component.html',
  styleUrls: ['./ontology-tree.component.scss']
})
export class OntologyTreeComponent implements OnInit, AfterViewInit {
  instructions:boolean = true;
  visible:boolean = false;

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

  // existing code continues...
  this.beep = (ontology_data as any).entities[src];
  this.updateTabs(parseInt(src));
  this.renderTreeChart(this.beep);
  this.switch_ontology_source({ target: { name: src, id: 'pharma_role' } });
}


  toggleCollapse(){
    this.instructions = !this.instructions;
    this.visible = !this.visible;
  }

  updateTabs(data_index) {  //updates the active class of tabs
    const tabs = d3.select('#tabs');
    if (data_index ==0) {
      tabs.select('#pharma_role').classed('active', true);
      tabs.select('#bio_role').classed('active', false);
      tabs.select('#chem_role').classed('active', false);
      tabs.select('#target_interaction').classed('active', false);
      tabs.select('#target').classed('active', false);
    } 
    else if(data_index == '1') {
      tabs.select('#pharma_role').classed('active', false);
      tabs.select('#bio_role').classed('active', true);
      tabs.select('#chem_role').classed('active', false);
      tabs.select('#target_interaction').classed('active', false);
      tabs.select('#target').classed('active', false);
    }
    else if(data_index == '2') {
      tabs.select('#pharma_role').classed('active', false);
      tabs.select('#bio_role').classed('active', false);
      tabs.select('#chem_role').classed('active', true);
      tabs.select('#target_interaction').classed('active', false);
      tabs.select('#target').classed('active', false);
    }
    else if(data_index == '3') {
      tabs.select('#pharma_role').classed('active', false);
      tabs.select('#bio_role').classed('active', false);
      tabs.select('#chem_role').classed('active', false);
      tabs.select('#target_interaction').classed('active', true);
      tabs.select('#target').classed('active', false);
    }
    else if(data_index == '4') {
      tabs.select('#pharma_role').classed('active', false);
      tabs.select('#bio_role').classed('active', false);
      tabs.select('#chem_role').classed('active', false);
      tabs.select('#target_interaction').classed('active', false);
      tabs.select('#target').classed('active', true);
    }
  }
  @ViewChild('searchInput') searchInput: ElementRef;
  switch_ontology_source(event) { //function switches data source from button clicks\
    //this.searchInput.nativeElement.value = '';
    this.src = event.target.name
    d3.select("#content").remove()      //clear the chart
    this.nameData_arr = [];             //reset the search options
    this.updateTabs(event.target.name)  //set the desired tab to active
    this.handle_url_params();
    this.renderTreeChart((ontology_data as any).entities[event.target.name]); //reload the chart with the selected data source
    
  }

  search_terms: string;
  search_id: number;
  src: number;
  nameData: Array<string> = [];
  nameData_arr: Array<{preferred_name: string, parent_name: string, id: string}> = [];  //array to hold the objects to pipe to the search dropdown
  filteredOptions: Observable<any[]>; //holds the filtered options
  private _filter(value: string) {
    return this.nameData_arr.filter(option => option.preferred_name.toLowerCase().includes(value));
  }

  getTitle(name_id: string) { //function takes in the id of a search and returns the nodes preferred name to display in the search box
    let result = this.nameData_arr.find((nameObj) => nameObj.id === name_id);
    return result.preferred_name + result.parent_name;
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
    //this filters options every time the search input is changed
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith(''),  //this can filter out items from showing
      map(preferred_name => preferred_name ? this._filter(preferred_name) : this.nameData_arr.slice()) //filter out any preferred name that doesnt match whats being typed
    );
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
        search_id: this.search_id
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

    this.search_id = parseInt(this._route.snapshot.queryParams['search_id']);

    if(this.search_id){
      this.searchTree()
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
      .style('fill', (d) => {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => {
        return d.children || d._children ? -13 : 13;
      })
      .attr('text-anchor', (d) => {
        return d.children || d._children ? 'end' : 'start';
      })
      .style('font', '16px sans-serif')
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
        .attr('y', 20)
        .text("IKEY: " + d.data.inchikey.substring(0,14));
        g.on("click", function(d) {
          window.open("/" + "compound_data/" + get_ikey(d).substring(0,14));
        })
      }
      if(d.data.smiles){    //if the node has a smile, show it
        var info = g.append('text')
        .classed('info', true)
        .attr('x', 20)
        .attr('y', 40)
        .text("SMILES: " + d.data.smiles);
      }

      //code below handles highlighting paths to hovered nodes
      //("circle").style("fill", "pink");

      d3.selectAll('circle.node')
      .attr('r', 10)
      .style('stroke-width', '3px')
      .style('stroke', 'steelblue')
      .style('fill', (d: any) => {
        return d._children ? 'lightsteelblue' : '#fff';
      })
      .style("fill", function(d: any) {
        if (d.class === "found") {
            return "#ff4136"; //red
        }
        else{
          let h = d.data
          if("children" in h ){
            if("inchikey" in h.children[0]){
            return "green";
            }
            else{
              return "lightsteelblue";
            }
          }
          else{
            return "lightsteelblue";
          }
        }
    }).style("stroke", function(d: any) {
      if (d.class === "found") {  //if the node is on a selected path
          return "#ff4136"; //red
      }
      else{ 
        let h = d.data
        if("children" in h ){ //if the node has children
          if("inchikey" in h.children[0]){  //if the child has an ikey, let the stroke be green
            return "green";
          }
          else{
            return "steelblue";
          }
        }
        // else if(h['reframe_compound']=="true"){
        //   return "pink";
        // }
        else if(h['reframe_compound']=="false"){
          return "pink";
        }
        else{
          return "steelblue";
        }
      }
  })
      .attr('cursor', 'pointer');

      d3.selectAll("path").style("stroke", "#c3c3c3");
      while (d.parent) {
        if("children" in d.data){
          if(!("inchikey" in d.data.children[0])){
            d3.selectAll("#node"+d.data.id).style("fill", "red")
          }
        }else{
          d3.selectAll("#node"+d.data.id).style("fill", "red")
        }
        if (d.parent != "null")
          d3.select("#link"+d.parent.data.id + "-" + d.data.id).style("stroke", "red")
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
      .attr('r', 10)
      .style('stroke-width', '3px')
      .style('stroke', 'steelblue')
      .style('fill', (d) => {
        return d._children ? 'lightsteelblue' : '#fff';
      })
      .style("fill", function(d) {
        if (d.class === "found") {
            return "#ff4136"; //red
        }
        else{
          let h = d.data
          if("children" in h ){
            if("inchikey" in h.children[0]){
            return "green";
            }
            else{
              return "lightsteelblue";
            }
          }
          else{
            return "lightsteelblue";
          }
          
        }
    })
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

      .style('stroke-width', '2px')
      .attr('d', function (d) {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    let linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(this.duration)
      .style("stroke", function(d) {
        if (d.class === "found") {
            return "#ff4136";
        }
        else{
          return  "#ccc";
        }})
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
