import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from "d3";

import *  as  ontology_data from './rancho_ontology.json';
// console.log(ontology_data.entities)
// interface HierarchyDatum {
//   preferred_name: string;
//   value: number;
//   children?: Array<HierarchyDatum>;
// }

// const testdata: HierarchyDatum = (ontology_data as any).default;

@Component({
  selector: 'app-ontology-tree',
  templateUrl: './ontology-tree.component.html',
  styleUrls: ['./ontology-tree.component.scss']
})
export class OntologyTreeComponent implements OnInit, AfterViewInit {
  title = 'd3tree';
  @ViewChild('chart') private chartContainer: ElementRef;

  
  
  root: any;
  tree: any;
  treeLayout: any;
  svg: any;


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

  constructor() { }

  ngOnInit() {}



  ngAfterViewInit(): void {
    interface HierarchyDatum {
      entities?: Array<HierarchyDatum>;
    }
    var testdata: HierarchyDatum = (ontology_data as any).entities;
    console.log(ontology_data)
    this.renderTreeChart((ontology_data as any).entities[0]);
  }

  updateTabs(data_index) {  //updates the active class of tabs
    const tabs = d3.select('#tabs');
    if (data_index == '0') {
      tabs.select('#pharma_role').classed('active', true);
      tabs.select('#chem_role').classed('active', false);
      tabs.select('#pharma_role').classed('active', false);
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

  switch_ontology_source(event) { //function switches data source from button clicks
    d3.select("#content").remove()      //clear the chart
    this.updateTabs(event.target.name)  //set the desired tab to active
    this.renderTreeChart((ontology_data as any).entities[event.target.name]); //reload the chart with the selected data source
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
      .on('click', this.click);

      
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
      d3.selectAll("circle").style("fill", "lightsteelblue");
      d3.selectAll("path").style("stroke", "#c3c3c3");
      while (d.parent) {
        d3.selectAll("#node"+d.data.id).style("fill", "red")
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
    
      console.log(link)

    let linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('id', function(d) {//for path highlight
         return "link" + d.parent.data.id + "-" + d.data.id //use ids to know what path leads where
      })
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', '2px')
      .attr('d', function (d) {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    let linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(this.duration)
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
