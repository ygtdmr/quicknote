import React from 'react'
import AppContext from '.././context/app'
import appData from '.././tools/app-data'
import MoveMode from './move-mode/navigation'
import Media from './media'

class Navigation extends React.Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {more:appData.getLastMore(), navigationHiding:false};
  }

  toggleMore(toggle, target_id, altKey) {
    const getChildIDList = () => {
      var result = [];
      appData.getData('subject').getInner(parent=>{
        parent.find(item=>item[0] === target_id)?.[2].getInner(selected_parent=>{
          result = result.concat(selected_parent.filter(item=>item[2]).map(item=>item[0]));
          return selected_parent;
        });
        return parent;
      });
      return result;
    };
    const id_list = altKey ? [target_id, ...getChildIDList()] : [target_id];
    if (toggle) {
      this.setState({more:this.state.more.filter(id=>!id_list.includes(id))});
    }else {
      this.setState({more:this.state.more.concat(id_list)});
    }
  }

  getButton(data_value, map_index, child_level=0) {
    child_level++;
    const isParent = data_value[2]?.length > 0;
    const isSelected = this.selectedSubjectID === data_value[0];
    if (this.subjectMoveMode && isParent && !isSelected) {
      data_value[2].getInner(parent=>{
        if (parent.some(item=>item[0] === this.selectedSubjectID) && !this.moving_more.some(id=> id === data_value[0])) {
          this.moving_more.push(data_value[0]);
        }
        return parent;
      });
    }
    const isMore = this.state.more.some(id=>id === data_value[0]) || this.moving_more.some(id=>id === data_value[0]);
    return <React.Fragment key={map_index}>
        <button disabled={this.subjectMoveMode || this.noteMoveMode} data-selected={isSelected || undefined} data-more={isMore || undefined}
          style={{paddingLeft: (child_level * 18) + 'px'}}
          onClick={e=>{
            if (e.target.tagName === 'BUTTON') {
              this.context.setState({selectedSubjectID: data_value[0]});
            }else {
              this.toggleMore(isMore, data_value[0], e.altKey);
            }
          }}
          onKeyUp={isParent ? e=>{
            if (['ArrowDown','ArrowRight'].includes(e.key)) {
              this.toggleMore(false, data_value[0], e.altKey);
            }else if (['ArrowUp','ArrowLeft'].includes(e.key)) {
              this.toggleMore(true, data_value[0], e.altKey);
            }
          } : undefined}>
          {isParent ? <Media aria-hidden="true" name="dropdown"/> : undefined}
          {data_value[1]}
        </button>
        {isParent ? <div>{data_value[2].map((e,i)=>this.getButton(e,i,child_level))}</div> : undefined}
      </React.Fragment>
  }

  clearMoreEmptyID() {
    const ids = [];
    appData.getData('subject').getInner(parent=>{
      parent.forEach(e=>ids.push(e[0]));
    });

    const cleared_more = this.state.more.filter(more_id=>{
      const more_item = appData.getSubjectByID(more_id);
      return ids.some(id=>id === more_id) && more_item[2] && more_item[2].length > 0;
    });

    if (JSON.stringify(this.state.more) !== JSON.stringify(cleared_more)) {
      this.setState({more:cleared_more});
    }
  }

  leaveNavigation() {
    setTimeout(()=>{
      Array.from(document.querySelectorAll('button:not(nav button, :disabled)')).find(element=>element.tabIndex !== -1).focus();
    },50);
  }

  hideNavigation() {
    this.setState({navigationHiding:true});
    setTimeout(()=>{
      this.context.setState({isVisibleNavigation:false});
      this.setState({navigationHiding:false});
    }, 240);
  }

  componentDidUpdate() {
    this.clearMoreEmptyID();
    appData.setCustom({last_more: this.state.more.length > 0 ? this.state.more : undefined});
  }

  render() {
    Object.assign(this, this.context.state);
    this.moving_more = [...this.state.more];
    const isSubjectEmpty = appData.getData('subject').length === 0;

    const nav = <nav hidden={!this.isVisibleNavigation}>
      {appData.isMobile && isSubjectEmpty ?
        <h4 className="empty-message">Your subjects do list here.</h4>
      :undefined}
      {this.subjectMoveMode ? <MoveMode parentComponent={this}/> : undefined}
      <button className="leave" data-ignore-focus disabled={this.subjectMoveMode || this.noteMoveMode} onClick={this.leaveNavigation}>Leave Navigation</button>
      {appData.getData(this.subjectMoveMode ? 'moving_subject' : 'subject').map((e,i)=>this.getButton(e,i))}
    </nav>;
    return appData.isMobile && this.isVisibleNavigation ?
        <div style={this.state.navigationHiding ? {animationName:'fadeOut', animationDuration:'0.25s', zIndex:'8'} : undefined}>
          {nav}
          <div className="background" onClick={!this.subjectMoveMode ? ()=>this.hideNavigation() : undefined}></div>
        </div>
        : nav;
  }

}

export default Navigation;