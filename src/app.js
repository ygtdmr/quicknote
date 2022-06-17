import React from 'react'
import AppContext from './context/app'
import appData from './tools/app-data'
import CheckAlertDialogs from './alertdialog/main.js'
import Navigation from './view/navigation'
import Note from './view/note'
import Header from './view/header'
import './sass/main.sass'

class App extends React.Component {

  componentDidMount() {
    window.localStorage.removeItem('moving_subject');
    window.localStorage.removeItem('moving_note');
  }

  componentDidUpdate() {
    appData.setCustom({last_selected_subject_id: this.state.selectedSubjectID});
  }

  constructor(props){
    super(props);
    this.state = {selectedSubjectID: appData.getLastSelectedSubjectID(),
                  selectedNoteIndex:undefined,
                  subjectMoveMode:false,
                  noteMoveMode:false,
                  isVisibleNavigation: !appData.isMobile,
                  alertDialog:undefined};
  }


  render () {
    return  <AppContext.Provider value={this}>
        <CheckAlertDialogs/>
        <Navigation/>
        <Header/>
        <main>
          <Note/>
        </main>
      </AppContext.Provider>
  }
}

export default App;