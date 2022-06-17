import React from 'react'
import AppContext from '../.././context/app'
import appData from '../.././tools/app-data'
import Media from '.././media'

const MoveMode = props => {
  const appContext = React.useContext(AppContext),
  {parentComponent} = props,
  {selectedSubjectID, selectedNoteIndex} = appContext.state,
  {currentPage} = parentComponent.state,
  pageCount = appData.getNotePageCountByID(selectedSubjectID),
  maxNoteLength = appData.getMaxNoteLength();

  const moveTarget = target_index => {
    const selected_item = appData.getData('moving_note')[0];
    selected_item[1].indexMove(selectedNoteIndex, target_index);
    appData.writeData('moving_note',[selected_item]);
    appContext.setState({selectedNoteIndex:target_index});
  };

  const moveVertical = type => {
    const current_page_note_length = currentPage === pageCount ?
      appData.getNoteByID(selectedSubjectID).length % maxNoteLength || maxNoteLength
      : maxNoteLength,
    current_page_note_index = Math.abs((maxNoteLength * currentPage) - selectedNoteIndex),
    target_index = type === 'up' ?
                        (current_page_note_index > 0 ? current_page_note_index - 1 : current_page_note_length - 1)
                        : type === 'down' ?
                        (current_page_note_index < current_page_note_length - 1 ? current_page_note_index + 1 : 0)
                        : undefined;
    moveTarget((maxNoteLength * currentPage) + target_index);
  };

  const onMoveUp = () => moveVertical('up');

  const onMoveDown = () => moveVertical('down');

  const onMoveLeft = () => {
    const previous_page = currentPage > 0 ? currentPage - 1 : pageCount;
    moveTarget(parentComponent.oldPage === previous_page
              ? parentComponent.oldIndex
              : maxNoteLength * previous_page);
    parentComponent.setState({currentPage: previous_page});
  };

  const onMoveRight = () => {
    const next_page = currentPage < pageCount ? currentPage + 1 : 0;
    moveTarget(parentComponent.oldPage === next_page
              ? parentComponent.oldIndex
              : maxNoteLength * next_page);
    parentComponent.setState({currentPage: next_page});
  };

  const onMoveClose = (backOldPage=true) => {
    window.localStorage.removeItem('moving_note');
    if (backOldPage) {
      parentComponent.setState({currentPage:parentComponent.oldPage});
    }
    appContext.setState({noteMoveMode:false, selectedNoteIndex:undefined});
    delete parentComponent.oldPage;
    delete parentComponent.oldIndex;
  };

  const onMoveApply = () => {
    appData.writeData('note',appData.getData('note').map(item=>item[0] === selectedSubjectID ? appData.getData('moving_note')[0] : item));
    onMoveClose(false);
  };

  if (parentComponent.oldIndex === undefined) {
    parentComponent.oldIndex = selectedNoteIndex;
  }

  if (parentComponent.oldPage === undefined) {
    parentComponent.oldPage = currentPage;
  }

  return <span className="move-mode" onKeyDown={e=>e.code === 'Escape' && onMoveClose()}>
    <span>
      <button aria-label="Up" onClick={onMoveUp} data-ignore-focus className="only-icon margin-right-16"><Media name="up" aria-hidden="true"/></button>
      <button aria-label="Down" onClick={onMoveDown} data-ignore-focus className="only-icon"><Media name="down" aria-hidden="true"/></button>
    </span>
    <span>
      <button aria-label="Close" onClick={onMoveClose} className="only-icon margin-right-16"><Media name="close" aria-hidden="true"/></button>
      <button aria-label="Apply Changes" onClick={onMoveApply} className="only-icon"><Media name="apply" aria-hidden="true"/></button>
    </span>
    {appData.getNotePageCountByID(selectedSubjectID) > 0 ?
      <span>
        <button aria-label="Previous Page" onClick={onMoveLeft} data-ignore-focus className="only-icon"><Media name="left" aria-hidden="true"/></button>
        <p className="margin-right-8 margin-left-8">{currentPage + 1}</p>
        <button aria-label="Next Page" onClick={onMoveRight} data-ignore-focus className="only-icon"><Media name="right" aria-hidden="true"/></button>
      </span>
    : undefined}
  </span>
};

export default MoveMode;