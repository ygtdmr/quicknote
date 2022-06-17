import React from 'react'
import AppContext from '.././context/app'
import appData from '.././tools/app-data'
import MoveMode from './move-mode/note'
import Media from '.././view/media'

class Note extends React.Component {
  static contextType = AppContext;

  constructor(props){
    super(props);
    this.state = {tableEmptyLength: 0, currentPage:0};
    this.tableBody = React.createRef();
    this.getNextPage = this.getNextPage.bind(this);
    this.getPreviousPage = this.getPreviousPage.bind(this);
    this.realInnerHeight = window.innerHeight;
  }

  componentDidMount() {
    this.setState({tableEmptyLength: this.tableContentEmptyLength()});
  }

  componentDidUpdate() {
    if (this.state.tableEmptyLength !== this.tableContentEmptyLength()) {
      this.setState({tableEmptyLength: this.tableContentEmptyLength()});
    }
    const page_count = appData.getNotePageCountByID(this.selectedSubjectID);
    if (appData.getNoteByID(this.selectedSubjectID).length > 0 && this.state.currentPage > page_count) {
      this.getPreviousPage();
    }
  }

  tableContentEmptyLength() {
    const root_font_size = window.innerWidth > 1024 ? 1 : 0.8, // type is rem...
    header_height = 56 * root_font_size,
    move_mode_height = this.noteMoveMode ? (40 * root_font_size) + 2 : 0,
    table_tr_height = (24 * root_font_size) + 2,
    tr_doms_height = Array.from(this.tableBody.current.querySelectorAll('tr[role="button"], tr[class="select-disable"]')).map(e=>e.clientHeight),
    tr_total_height = tr_doms_height.length > 0 ? tr_doms_height.reduce((previousValue, currentValue) => previousValue + currentValue) : 0,
    result = Math.floor((this.realInnerHeight - (header_height + move_mode_height + table_tr_height + tr_total_height)) / table_tr_height);
    return result > 0 ? result : 0;
  }

  getNextPage() {
    const page_count = appData.getNotePageCountByID(this.selectedSubjectID);
    this.setState({currentPage: this.state.currentPage < page_count ? this.state.currentPage + 1 : 0});
  }

  getPreviousPage() {
    const page_count = appData.getNotePageCountByID(this.selectedSubjectID);
    this.setState({currentPage: this.state.currentPage > 0 ? this.state.currentPage - 1 : page_count});
  }

  render () {
    const max_note_length = appData.getMaxNoteLength();
    Object.assign(this, this.context.state);
    return <React.Fragment>
      {this.noteMoveMode ? <MoveMode parentComponent={this}/> : undefined}
      <div className="table-content select-disable" style={this.noteMoveMode ? {maxHeight:'calc(100vh - 3.5rem - calc(2.5rem + 2px))'} : undefined}>

        {(!this.noteMoveMode && appData.getNoteByID(this.selectedSubjectID).length > max_note_length) ?
          <div className="page-control">
            <button disabled={this.subjectMoveMode} onClick={this.getPreviousPage} data-ignore-focus className="only-icon" aria-label="Previous Page"><Media name="left" width="0.5rem" aria-hidden="true"/></button>
            <p className="margin-right-8 margin-left-8">{this.state.currentPage + 1}</p>
            <button disabled={this.subjectMoveMode} onClick={this.getNextPage} data-ignore-focus className="only-icon" aria-label="Next Page"><Media name="right" width="0.5rem" aria-hidden="true"/></button>
          </div> : undefined}

        <table>
          <thead>
            <tr><th>Note</th></tr>
          </thead>
          <tbody ref={this.tableBody}>
            {appData.getNoteByID(this.selectedSubjectID)
              .slice(this.state.currentPage * max_note_length, (this.state.currentPage + 1) * max_note_length)
              .map((note,index)=>
                <tr {...(this.subjectMoveMode || this.noteMoveMode) ? {className:'select-disable'} : {role:'button', tabIndex:'0'}}
                  key={index}
                  data-selected={(this.noteMoveMode && (this.selectedNoteIndex - (this.state.currentPage * max_note_length)) === index) || undefined}
                  onClick={(this.subjectMoveMode || this.noteMoveMode) ? undefined : ()=>{
                    this.context.setState({selectedNoteIndex:(max_note_length * this.state.currentPage) + index, alertDialog:'edit_note'});
                  }}>
                  <td>{note}</td>
                </tr>
            )}
            {[...Array(this.state.tableEmptyLength)].map((e,i)=>
              <tr key={i}><td></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  }
}

export default Note;