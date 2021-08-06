// Filename:		TermsList.js
// Purpose:		Showing list of terms of a specific domain.
/*This component receives an array of objects with the following structure:
var array = [{'word': w[0], 'posFreq': w[1], 'negFreq': w[2], 'tags': w[3]},
             {'word': w[0], 'posFreq': w[1], 'negFreq': w[2], 'tags': w[3]}
           ];
*/
// Author: Sonia Castelo (scastelo2@gmail.com)


import React, { Component } from 'react';
import {scaleLinear} from 'd3-scale';
import {range} from 'd3-array';
import TermsSnippetViewer from "./TermsSnippetViewer";
import Divider from 'material-ui/Divider';
import { Glyphicon } from 'react-bootstrap';
import $ from "jquery";
import FlatButton from 'material-ui/FlatButton';
import {fullWhite} from 'material-ui/styles/colors';
import AddBoxTermIcon from 'material-ui/svg-icons/content/add-box';
import AddTermIcon from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'material-ui/SvgIcon';
import AvStop from 'material-ui/svg-icons/av/stop';
import { Col, Row} from 'react-bootstrap';
import ActionAutorenew from 'material-ui/svg-icons/action/autorenew';
import RaisedButton from 'material-ui/RaisedButton';

//import {select} from 'd3-selection';
//import cloud from 'd3-cloud';
//import ReactFauxDom from 'react-faux-dom';


class TermsList extends Component {
    constructor(props){
        super(props);
        this.state = {
          listTerms: [],
          term:"",
          focusContext:false,
          focusTermContext:"",
          focusContextStyle:"#E6E6E6",//color withput focus
          openCreateTerm: false,
          newNameTerm:"",
          session:{},
        };
        this.focusTextField = this.focusTextField.bind(this);
        this.textInput = null;
        this.termsFromFile=[];

        //this.startTermsList = this.startTermsList.bind(this);
        //this.drawWordCloud = this.drawWordCloud.bind(this);
    }

    componentWillMount(){
      this.setState({listTerms:this.props.listTerms, session:this.props.session});
    }

    componentWillReceiveProps(nextProps){
      this.setState({listTerms:nextProps.listTerms});
    }

    //Handling open/close create a new term Dialog
    handleOpenAddTerm = () => {
      this.setState({openCreateTerm: true});
      this.focusTextField();
    };
    handleCloseAddTerm = () => {
      this.setState({openCreateTerm: false, newNameTerm:"",});
      this.termsFromFile=[]; // Empting the terms from file.
    };
    //Handling changes into TextField newNameTerm (updating TextField).
    handleTextChangeNewNameTerm(e){
      this.setState({ newNameTerm: e.target.value});
    }
    // Explicitly focus the text input using the raw DOM API
    focusTextField() {
      setTimeout(() => this.textInput.focus(), 100);
    }
    handleAutorenewTerm = () =>{
        this.props.updateListTermParent([]);
        this.props.loadTerms();
  }
    //Checking whether there is already the word.
    addEntries(newTerms, entries){
      var updateListTerm = this.state.listTerms;
      var entriesUpdated = [];
      var newTermsUpdated = [];
      for (var i = 0; i < newTerms.length; i++) {
        if(newTerms[i]!==""){
          var duplicate = false;
          var found = updateListTerm.some(function (obj) {
            return obj.word === newTerms[i];
          });
          if (found) duplicate = true;
          if (duplicate === false) {
            entriesUpdated.push(entries[i]);
            newTermsUpdated.push(newTerms[i]);
            var tempArray=[];
            tempArray.push(entries[i]);
            updateListTerm = tempArray.concat(updateListTerm);
          }
        }
      }
      //if (duplicate === false) updateListTerm = entries.concat(updateListTerm);
      this.setState({listTerms:updateListTerm, openCreateTerm: false, newNameTerm:"",});
      this.props.updateListTermParent(updateListTerm);
    }

    //Adding custom positive terms (just one term or more than one from file).
    addPosTerms(){
      if(this.termsFromFile.length===0){
        var newTerm = this.state.newNameTerm;
        var arrayTerms = [];
        arrayTerms.push(newTerm);
        this.addPosTerm(arrayTerms);
      }
      else{
        this.addPosTermFromFile();
      }
    }

    //Adding custom negative terms (just one term or more than one from file).
    addNegTerms(){
      if(this.termsFromFile.length===0){
        var newTerm = this.state.newNameTerm;
        var arrayTerms = [];
        arrayTerms.push(newTerm);
        this.addNegTerm(arrayTerms);
      }
      else{
        this.addNegTermFromFile();
      }
    }

    //Adding custom positive terms.
    addPosTerm(newTerms){
      var entries = [];
      for (var i = 0; i < newTerms.length; i++) {
        entries.push({'word': newTerms[i], 'posFreq': 0, 'negFreq': 0, 'tags': ["Positive", "Custom"]});
      }
      this.addEntries(newTerms, entries);
      this.setTermTag(newTerms,'Positive;Custom', true, this.props.session);
    }

    //Adding custom negative terms.
    addNegTerm(newTerms){
      var entries = [];
      for (var i = 0; i < newTerms.length; i++) {
        entries.push({'word': newTerms[i], 'posFreq': 0, 'negFreq': 0, 'tags': ["Negative", "Custom"]});
      }
      this.addEntries(newTerms, entries);
      this.setTermTag(newTerms,'Negative;Custom', true, this.props.session);
    }

    //Adding terms from file
    addPosTermFromFile(){
      this.addPosTerm(this.termsFromFile);
      this.termsFromFile=[];
    }

    //Adding terms from file
    addNegTermFromFile(){
      this.addNegTerm(this.termsFromFile);
      this.termsFromFile=[];
    }

    //Remove a custom term.
    removeTerm(term){
      var updateListTerm = this.state.listTerms;
      var removeWord = updateListTerm.indexOf(term);
      updateListTerm.splice(removeWord,1);
      this.setState({listTerms:updateListTerm});
      $.post(
        '/deleteTerm',
        {'term': term['word'], 'session': JSON.stringify(this.props.session)},
        function(){
          console.log("deleted term: " + term['word']);
        }.bind(this)).fail(function(){
          console.log("Something wrong happen");
        }.bind(this)

      );
    }

    startSnippets(term){
      this.setState({term:term});
    }

    focusTermContext(term){
      if(this.state.focusTermContext==term)
        this.setState({focusContext:false, focusTermContext:"", focusContextStyle:"#E6E6E6",})
      else
        this.setState({focusContext:true, focusTermContext:term, term:term, focusContextStyle:"black"})
    }

    // Adds tag to term.
    setTermTag(term, tag, applyTagFlag, session) {
        $.post(
          '/setTermsTag',
          {'terms': term.join('|'), 'tag': tag, 'applyTagFlag': applyTagFlag, 'session': JSON.stringify(session)},
          function() {
              console.log("terms tagged: " + term.join(','));
          }.bind(this)).fail(function() {
                console.log("Something wrong happen. Try again.");
          }.bind(this));
    };

    // Responds to toggle of a term.
    // Term format:
    // {'word': term, 'tags': [], ...}
    updateTermTag(term){
      // State machine: Neutral -> Positive -> Negative -> Neutral.
      var updateListTerm = this.state.listTerms;
      var tags = term['tags'];
      if(tags.indexOf('Custom') < 0){ //if 'Custom' is not present.
    	  var wordId = term['word'].replace(/ /g, "_");
    	  wordId = '#'+wordId;
    	  var color = ($(wordId).css("fill")).toString();
    	  var isPositive = color=="rgb(0, 0, 255)";//tags.indexOf('Positive') != -1;
    	  var isNegative = color=="rgb(255, 0, 0)";//tags.indexOf('Negative') != -1;
    	  var arrayTerms = [];
    	  arrayTerms.push(term['word']);
    	  var objIndex = updateListTerm.findIndex((obj => obj.word === term['word']));
    	  var newTag = "";
    	  if (isPositive) {
                  // It was positive, so it turns negative.
                  this.setTermTag(arrayTerms, 'Positive', false, this.props.session);
                  this.setTermTag(arrayTerms, 'Negative', true, this.props.session);
                  //Update object's name property.
                  newTag = 'Negative';

                  // Removes tag 'Positive' from tags array, adds 'Negative'.
                  $(wordId).css('fill','red');
                  updateListTerm[objIndex].tags = newTag;
    	  }
    	  else if (isNegative) {
                  // It was Negative, so it turns Neutral.
                  this.setTermTag(arrayTerms, 'Negative', false, this.props.session);
                  newTag = 'Neutral';
                  // Removes tag 'Negative' from tags array.
                  $(wordId).css('fill','black');
                  updateListTerm[objIndex].tags.splice(0,1);
    	  }
    	  else {
                  // It was Neutral, so it turns Positive.
                  this.setTermTag(arrayTerms, 'Positive', true, this.props.session);
                  newTag = 'Positive';
                  // Adds tag 'Positive' to tags array.
                  $(wordId).css('fill','blue');
                  updateListTerm[objIndex].tags = newTag;
    	  }
              //updateListTerm[objIndex].tags = newTag;
    	  this.setState({listTerms:updateListTerm});
    	  this.props.updateListTermParent(updateListTerm);
      }
    }

    // Store the uploaded terms from file
    runLoadTermsFileQuery(txt) {
        var allTextLines = txt.split(/\r\n|\n/);
        //var urlsString = allTextLines.join(" ");
	allTextLines.map((w)=>{
	    if(w !== "")
		this.termsFromFile.push(w);
	});
        ; //.push(urlsString);
        //this.runLoadUrls(urlsString);
    }

    //Reading file's content.
    handleFile(event) {
      const reader = new FileReader();
      const file = event.target.files[0];
      reader.onload = (upload) => {
        this.runLoadTermsFileQuery(upload.target.result);
      };
      reader.readAsText(file);
    }


    render() {
      if(this.state.listTerms.length>0){
	  var maxBarWidth = 30;
	  // Sets maximum frequency for positive/negative frequencies to set bars width in wordlist.
	  var maxPosFreq = Math.max.apply(null,this.state.listTerms.map(function(w) {return w["posFreq"]; }));
	  var maxNegFreq = Math.max.apply(null,this.state.listTerms.map(function(w) {return w["negFreq"]; }));
	  var maxFreq = Math.max(maxPosFreq, maxNegFreq);
	  // Scales for left/right bars.
	  var barScale = scaleLinear().range([0, maxBarWidth]);
	  barScale.domain([0, maxFreq]);
	  let y =0;
	  let terms_array = [];

	  const DeleteIcon = (props) => (
		  <SvgIcon {...props}>
		  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
		  </SvgIcon>
	  );
	  terms_array.push(<g transform={`translate(0, 0)`}><g>
			   <AvStop height="15" width="15" y="-2px" x="-10px"></AvStop>
			   </g></g>);
	  y=y+10;
	  let loopListTerms = this.state.listTerms.map(function(w) {
              // Aligns left bar to right.
              let widthPos = barScale(w['posFreq']);
              // Aligns left bar to left.
              var widthNeg = barScale(w['negFreq']);
              var currentTerm =w["word"];
              var tags = w['tags']; //var isPositive = (tags.indexOf('Positive') != -1 || tags.indexOf('Relevant') != -1); var isNegative = tags.indexOf('Negative') != -1 || tags.indexOf('Irrelevant') != -1;

	      //Initialize Pins
              var colorPin = (this.state.focusContext && this.state.focusTermContext==currentTerm)? "black":"#9575CD";
              var sizePin = (this.state.focusContext && this.state.focusTermContext==currentTerm)? "15":"12";
              var topPin = (this.state.focusContext && this.state.focusTermContext==currentTerm)? "-2":"-2";
	      let pins = <g className={"pins"} style={{cursor:"pointer", letterSpacing:4, fontSize:sizePin, color:colorPin}}
	                 onClick={this.focusTermContext.bind(this, currentTerm)} onMouseOver={this.startSnippets.bind(this, currentTerm)}>
		         <AvStop height="15" width="15" y={topPin} x="25px" color={colorPin}></AvStop>
		         </g>;

	      //Initialize delete button
              var removeTermButton = (tags.indexOf('Custom')!= -1)?<DeleteIcon height="15" width="15" y="-2px" x="8px" style={{color:"orange"}}></DeleteIcon>:<span/>;
	      let custom = <g className={"custom"} onClick={this.removeTerm.bind(this, w)} style={{cursor:"pointer", letterSpacing:4, color:"orange"}}  >
                           {removeTermButton}
                           </g>;

              var colorWord = (tags.indexOf('Positive') != -1 || tags.indexOf('Relevant') != -1)?"blue": (tags.indexOf('Negative') != -1 || tags.indexOf('Irrelevant') != -1)?"red":"black";

              let words = <g transform={`translate(50, 10)`}
	                  onClick={this.updateTermTag.bind(this, w)} onMouseOver={this.startSnippets.bind(this, currentTerm)}>
                          <text id={currentTerm.replace(/ /g, "_")} fontSize="12" fontFamily="sans-serif" textAnchor="start" style={{fill:colorWord}} >{currentTerm}</text>
                          </g>;


              // Adds right bars (aligned to left).
              let barNegative = <g transform={`translate(202, 0)`}>
                  <rect y={5} height={6} width={maxBarWidth}  fillOpacity="0.3" style={{fill:"#000000"}} />
                  <rect y={5} height={6} width={widthNeg} x={maxBarWidth - widthNeg} style={{fill:"red"}}/>
                  </g>;
              // Adds left bars (aligned to right).
              let barPositive = <g transform={`translate(232, 0)`}>
                  <rect y={5} height={6} width={maxBarWidth}  fillOpacity="0.3" style={{fill:"#000000"}}/>
                  <rect y={5} height={6} width={widthPos} x={0} style={{fill:"blue"}}/>
                  </g>;

              let bars =   <g id="terms" transform={`translate(0, ${y})`}>
		           {custom}
	                   {pins}
                           {words}
                           {barNegative}
                           {barPositive}
                           </g>;
              terms_array.push(bars);
              y=y+16;
          }.bind(this));
          const actionsAddTerm = [
		  <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseAddTerm}/>,
		  <FlatButton label="Relevant" style={{marginLeft:10}} primary={true} keyboardFocused={true} onTouchTap={this.addPosTerms.bind(this)}/>,
		  <FlatButton label="Irrelevant" primary={true} keyboardFocused={true} onTouchTap={this.addNegTerms.bind(this)}/>,
          ];

          return (
                  <div>
                  <div style={{fontSize: 10, height: '190px', overflowY: "scroll",}}>
                  <svg ref="svg_container"  width={this.props.width} height={this.state.listTerms.length*20}  style={{marginTop:4, cursor:'default',MozUserSelect:'none', WebkitUserSelect:'none',msUserSelect:'none'}} xmlns="http://www.w3.org/2000/svg">
                  {terms_array}
                  </svg>
                  </div>
                  <div style={{ textAlign:"right", margin:"3px 0px 5px 0px"}}>
                    <RaisedButton
                      label="Add term"
                      labelStyle={{textTransform: "capitalize", fontSize:10, marginTop:"-5px", marginLeft:"-5px", marginRight:"-15px"}}
                      backgroundColor={this.props.backgroundColor}
                      onTouchTap={this.handleOpenAddTerm.bind(this)}
                      icon={<AddTermIcon style={{marginTop:"-2px", marginLeft:"-5px", height:15}}/>}
                      style={{marginRight:"0px",marginTop:0, height:20, width:95}}
                    />
                  <RaisedButton
                    label="Reload"
                    labelStyle={{textTransform: "capitalize", fontSize:10, marginTop:"-5px", marginLeft:"-5px", marginRight:"-15px"}}
                    backgroundColor={this.props.backgroundColor}
                    onTouchTap={this.handleAutorenewTerm.bind(this)}
                    icon={<ActionAutorenew style={{marginTop:"-2px", marginLeft:"-5px", height:15}}/>}
                    style={{marginRight:"10px",marginTop:0, height:20, width:85, marginLeft:10}}
                  />
                  <Dialog title="Adding a term" actions={actionsAddTerm} modal={false} open={this.state.openCreateTerm} onRequestClose={this.handleCloseAddTerm.bind(this)}>
                  <Row>
                      <TextField style={{width:'268px', fontSize: 12, borderColor: 'gray', borderWidth: 1, background:"white", borderRadius:"1px"}} ref={(input) => { this.textInput = input;}} value={this.state.newNameTerm}
	                   onChange={this.handleTextChangeNewNameTerm.bind(this)} hintText="Write new term." hintStyle={{ marginLeft:10}} inputStyle={{marginBottom:10, marginLeft:10, paddingRight:20}} />
                  </Row>
                  <Row style={{marginTop:30}}> <p style={{fontSize:12, marginLeft:10}}> Uploading terms from file:</p> <br />
		      <FlatButton style={{marginLeft:'15px'}}
	                 label="Load terms from file"
                         labelPosition="before"
                         containerElement="label" >
                         <input type="file" id="csvFileInput" onChange={this.handleFile.bind(this)} name='file' ref='file' accept=".txt"/>
                      </FlatButton>
                  </Row>
                  <br />
                  </Dialog>
		  </div>
                     <Divider style={{margin:"15px 10px 10px 10px"}}/>
                     <div style={{fontSize: 12, marginTop:4, adding:10, height: '145px', overflowY: "scroll", borderTopColor:"#FFFFFF"}}>
                       <TermsSnippetViewer term= {this.state.term} session={this.props.session} focusContext={this.state.focusContext} focusTermContext={this.state.focusTermContext}/>
                     </div>
                  </div>

          );
      }
	else {
            return(<div/>);
	}

    }
}

TermsList.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
};

TermsList.defaultProps = {
  width: 300,
  height: 300,
  backgroundColor:"#9A7BB0",
};



export default TermsList;
