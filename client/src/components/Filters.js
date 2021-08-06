import React, {Component} from 'react';
import {Card, CardHeader, CardMedia} from 'material-ui/Card';
import FiltersTabs from './FiltersTabs';
import Avatar from 'material-ui/Avatar';
import CheckList from 'material-ui/svg-icons/av/playlist-add-check';

const styles = {
  card: {
    background: 'white',
    borderRadius: '0px 0px 0px 0px',
    borderStyle: 'solid',
    borderColor: '#C09ED7',
    borderWidth: '1px 0px 1px 0px'

  },
  avatar:{
    margin:'-4px 8px 0px 0px',
  },
  cardHeader:{
    background: '#DCCCE7',
    padding:'10px 1px 10px 6px',
    borderRadius: '0px 0px 0px 0px',
  },
  cardMedia:{
    background: '#DCCCE7',
    padding:'0px 4px 2px 4px',
    borderRadius: '0px 0px 0px 0px',
    height: "500px",
  },

};

class Filters extends Component{

    constructor(props) {
      super(props);
      this.state = {
        expanded: undefined,
        sessionString:"",
        session: undefined,
        sizeAvatar:undefined,
        checked_queries:[],
        checked_tags:[],
      };
      this.queryFromSearch=true;
    }

    componentWillMount(){
     this.setState({
       expanded: this.props.statedCard,
       session:this.props.session,
       sessionString:JSON.stringify(this.props.session),
       sizeAvatar:this.props.sizeAvatar,
       });
    }

    componentWillReceiveProps(nextProps) {
      this.queryFromSearch = (this.props.queryFromSearch ===undefined)?false:true;
      // Calculate new state
      if(nextProps.statedCard !== this.state.statedCard){
        this.setState({expanded: nextProps.statedCard}, function() {
             this.setState({expanded: nextProps.statedCard});
        });
      }
      if(JSON.stringify(nextProps.session) !== this.state.sessionString || this.queryFromSearch){
        this.setState({
          session:nextProps.session,
          sessionString:JSON.stringify(this.props.session),
        });
      }
      else{
        return;
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      this.queryFromSearch = (this.props.queryFromSearch ===undefined)?false:true;
      //console.log("filter before shouldComponentUpdate");
      //console.log(this.props.update);
      if(nextProps.updateCrawlerData==="updateCrawler" || nextProps.updateCrawlerData==="stopCrawler" || this.queryFromSearch || this.props.update || JSON.stringify(nextProps.session) !== this.state.sessionString || nextProps.statedCard !== this.state.statedCard || JSON.stringify(nextState.session) !== this.state.sessionString) {
            return true;
      }
      //console.log("filter after shouldComponentUpdate");
      return false;
    }


    handleExpandChange = (expanded) => {
      this.setState({expanded: expanded});
      if(expanded){
        this.props.setActiveMenu(expanded, 1);
      }
    }

    handleToggle = (event, toggle) => {
      this.setState({expanded: toggle});
    }

    handleExpand = () => {
      this.setState({expanded: true});
    }

    handleReduce = () => {
      this.setState({expanded: false});
    }

    //Send information about a query that is running (from FiltersTabs.js to Body.js)
    updateStatusMessage(value, term){
	this.props.updateStatusMessage(value, term);
    }

    updateSession(newSession){
      this.setState({
        session:newSession,
        sessionString:JSON.stringify(newSession),
      });
      this.props.updateSession(newSession);
    }

    deletedFilter(sessionTemp){
      this.setState({
          session:sessionTemp, sessionString: JSON.stringify(sessionTemp)
      });
      this.props.deletedFilter(sessionTemp);
    }

    /*updateCheckedQueries(checkedQueries){
      this.setState({
        checked_queries:checkedQueries,
      });
    }
*/

  render(){
    return(
      <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={styles.card}>
           <CardHeader
             title="Filters"
             avatar={ <Avatar color={'white'} backgroundColor={'#7940A0'} size={this.props.sizeAvatar} style={styles.avatar} icon={<CheckList />} />}
             style={styles.cardHeader}
             actAsExpander={true}
             showExpandableButton={true}
           />
           <CardMedia expandable={true} style={styles.cardMedia}>
              <FiltersTabs updateCrawlerData={this.props.updateCrawlerData} queryFromSearch={this.queryFromSearch} update={this.props.update}  session={this.state.session} updateStatusMessage={this.updateStatusMessage.bind(this)} updateSession={this.updateSession.bind(this)} checkedQueries={this.state.checked_queries} deletedFilter={this.deletedFilter.bind(this)}/>
           </CardMedia>
       </Card>
    )
  }

}

export default Filters;
