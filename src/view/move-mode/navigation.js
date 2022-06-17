import React from 'react'
import AppContext from '../.././context/app'
import appData from '../.././tools/app-data'
import Media from '.././media'

const MoveMode = props => {
  const appContext = React.useContext(AppContext),
  {parentComponent} = props,
  {selectedSubjectID} = appContext.state;

  const movePreview = callback => {
    appData.writeData('moving_subject', appData.getData('moving_subject')
      .getInner(parent=>callback(parent)), parentComponent);
  };

  const moveVertical = type => {
    movePreview(parent=>{
      const item = parent.find(item=>item[0] === selectedSubjectID);
      if (item) {
        const item_index = parent.indexOf(item);
        parent.indexMove(item_index, type === 'up' ?
                        (item_index > 0 ? item_index - 1 : parent.length - 1)
                        : type === 'down' ?
                        (item_index < parent.length - 1 ? item_index + 1 : 0)
                        : undefined);
      }
      return parent;
    });
  };

  const onMoveUp = () => moveVertical('up');

  const onMoveDown = () => moveVertical('down');

  const onMoveLeft = () => {
    var found = undefined;
    movePreview(parent=>{
      if (found) {
        parent.forEach((item, index)=>{
          if (item[2]?.some(e=>e[0] === found[0])) {
            item[2] = item[2].filter(e=>e[0] !== found[0]);
            if (item[2].length === 0) {
              parent[index] = item.slice(0,2);
            }
            parent.splice(index+1, 0, found);
            found = false;
          }
        });
      }else if(found === undefined) {
        found = parent.find(e=>e[0] === selectedSubjectID);
      }
      return parent;
    });
  };

  const onMoveRight = () => {
    movePreview(parent=>{
      const found = parent.find(e=>e[0] === selectedSubjectID);
      if (found) {
        const found_index = parent.indexOf(found);
        if (found_index > 0) {
          const target = parent[found_index - 1];
          if (target[2]) {
            target[2].push(found);
          }else {
            target[2] = [found];
          }
          return parent.filter(e=>e[0] !== found[0]);
        }
      }
      return parent;
    });
  };

  const onMoveClose = () => {
    window.localStorage.removeItem('moving_subject');
    appContext.setState({subjectMoveMode:false});
  };

  const onMoveApply = () => {
    appData.writeData('subject', appData.getData('moving_subject'));
    parentComponent.setState({more:parentComponent.moving_more});
    onMoveClose();
  };

  return <div className="move-mode" onKeyDown={e=>e.code === 'Escape' && onMoveClose()}>
    <span>
      <button aria-label="Close" onClick={onMoveClose} className="only-icon"><Media name="close" aria-hidden="true"/></button>
      <button aria-label="Apply Changes" onClick={onMoveApply} className="only-icon"><Media name="apply" aria-hidden="true"/></button>
    </span>
    <span>
      <span>
        <button aria-label="Up" onClick={onMoveUp} data-ignore-focus className="only-icon margin-right-16"><Media name="up" aria-hidden="true"/></button>
        <button aria-label="Down" onClick={onMoveDown} data-ignore-focus className="only-icon"><Media name="down" aria-hidden="true"/></button>
      </span>
      <span>
        <button aria-label="Outside" onClick={onMoveLeft} data-ignore-focus className="only-icon margin-right-16"><Media name="left" aria-hidden="true"/></button>
        <button aria-label="Inside" onClick={onMoveRight} data-ignore-focus className="only-icon"><Media name="right" aria-hidden="true"/></button>
      </span>
    </span>
  </div>
};

export default MoveMode;