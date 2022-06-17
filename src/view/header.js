import React from 'react'
import AppContext from '.././context/app'
import appData from '.././tools/app-data'
import Media from './media'

const Header = () => {
  const appContext = React.useContext(AppContext),
  {selectedSubjectID, subjectMoveMode, noteMoveMode} = appContext.state;

  const toggleNavigation = () => {
    appContext.setState({isVisibleNavigation: !appContext.state.isVisibleNavigation});
  };

  return <header>
    <h1 onClick={appData.isMobile ? toggleNavigation : undefined}>{appData.getSubjectByID(selectedSubjectID)?.[1] ?? 'Project'}</h1>
    <div className="buttons">
      <button className="only-icon"
        disabled={selectedSubjectID === undefined || subjectMoveMode || noteMoveMode}
        aria-label="Edit Note"
        onClick={()=>appContext.setState({alertDialog:'edit_subject'})}>
          <Media aria-hidden="true" name="edit"/>
        </button>
      <button className="only-icon"
        disabled={subjectMoveMode || noteMoveMode}
        aria-label="Add Note"
        onClick={()=>appContext.setState({alertDialog:'add'})}>
          <Media aria-hidden="true" name="add"/>
      </button>
      <button className="only-icon"
        disabled={subjectMoveMode || noteMoveMode}
        aria-label="Settings"
        onClick={()=>appContext.setState({alertDialog:'settings'})}>
          <Media aria-hidden="true" name="settings"/>
      </button>
    </div>
  </header>
};

export default Header;