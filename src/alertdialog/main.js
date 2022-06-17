import React from 'react';

import Media from '.././view/media';
import AlertDialog from '.././view/alertdialog';
import Input from '.././view/input';
import Fragment from '.././view/fragment';

import appData from '.././tools/app-data';
import AppContext from '../context/./app';

const CheckAlertDialogs = props => {
  const type = {};
  const appContext = React.useContext(AppContext),
  parentState = appContext.state,
  {alertDialog, selectedSubjectID, selectedNoteIndex} = parentState;

  const note_more_props = {
    onKeyDown: e=>{
      if (e.ctrlKey && e.code === 'Enter') {
        e.currentTarget.form.nextElementSibling.querySelector('button[form]').click();
        e.preventDefault();
      }
    },
    onClick: e=>{
      const {offsetWidth, offsetHeight} = e.currentTarget;
      const [defaultWidth, defaultHeight] = [432, 132];
      appData.setCustom({note_input: (defaultWidth === offsetWidth && defaultHeight === offsetHeight) ? undefined : {width:offsetWidth,height:offsetHeight}});
    },
    style: appData.getData('custom').note_input,
    children: appData.isSafari ?
      <button type="button" className="reset" onClick={e=>{
          e.currentTarget.parentElement.querySelector('textarea').style.cssText = '';
          appData.setCustom({note_input:undefined});
        }}><h6>Reset Size</h6></button>
      : undefined
  };

  const quitDialog = properties => {
    appContext.setState(Object.assign({alertDialog:undefined}, properties ?? {}));
  };

  type.add = () => <AlertDialog cancelable title="Add"
    form="form_add_data"
    primaryButtonText="Add"
    onCloseDialog={quitDialog}
    onApplyDialog={data=>{
      if (data) {
        switch (data.fragment) {
          case 'note':
            appData.writeData('note', appData.addNoteByID(selectedSubjectID, data.note), appContext);
            break;
          case 'subject':
            if (appData.getData('subject').length > 0) {
              appData.writeData('subject', appData.addSubject([appData.getNewSubjectID(), data.subject_name], selectedSubjectID ?? appData.getData('subject')[0][0], data.subject_inside), appContext);
            }else {
              appData.writeData('subject', [[0, data.subject_name]], appContext);
            }
            break;
          default:
        }
      }
      return data;
    }}>
    <form id="form_add_data">
      <Fragment>
        {selectedSubjectID !== undefined ?
          <Fragment.View title="Note" className="margin-bottom-all-8">
            <input name="fragment" value="note" type="hidden"/>
            <Input name="note" type="textarea" label="Note" customDescription="Enter the note." autoFocus={!appData.isMobile} required {...note_more_props}/>
          </Fragment.View>
         : undefined}
        <Fragment.View title="Subject" className="margin-bottom-all-8">
          <input name="fragment" value="subject" type="hidden"/>
          <Input name="subject_name" maxLength="64" customDescription="Enter the subject name." label="Subject name" autoFocus={!appData.isMobile} required/>
          {selectedSubjectID !== undefined ?
            <Input name="subject_inside" type="checkbox" label="Inside" customDescription="This subject be inside selected subject?"/>
          : undefined}
        </Fragment.View>
      </Fragment>
    </form>
  </AlertDialog>

  type.edit_subject = () => <AlertDialog cancelable title="Edit Subject"
    form="form_edit_subject"
    primaryButtonText="Save"
    onCloseDialog={quitDialog}
    onApplyDialog={data=>{
      const current_subject_name = appData.getSubjectByID(selectedSubjectID)[1];
      const isValid = data && data.subject_name !== current_subject_name;
      if (isValid) {
        appData.writeData('subject', appData.getData('subject').getInner(parent=>parent.map(item=>{
          if (item[0] === selectedSubjectID) {
            item[1] = data.subject_name;
          }
          return item;
        })), appContext);
      }
      return isValid;
    }}>
    <form id="form_edit_subject" className="margin-bottom-all-8">
      <Input name="subject_name" label="Subject Name" defaultValue={appData.getSubjectByID(selectedSubjectID)[1]} required/>
      <div>
        <button disabled={appData.getData('subject').length === 1 && appData.getData('subject')[0][2]?.length === 0} type="button" onClick={()=>{
          appContext.setState(
            appData.isMobile ? {subjectMoveMode:true, isVisibleNavigation:true} : {subjectMoveMode:true}
          );
          appData.writeData('moving_subject', appData.getData('subject'));
          quitDialog();
          }}><Media aria-hidden="true" width="1.5rem" height="1.5rem" name="move"/>Move Subject</button>
        <button type="button" style={{color:'var(--color-6)', float:'right'}} onClick={()=>{
            if (window.confirm('Are you sure you want to delete this subject?')) {
              appData.writeData('note', appData.removeNoteByID(selectedSubjectID));
              appData.writeData('subject', appData.removeSubjectByID(selectedSubjectID), appContext);
              appContext.setState({selectedSubjectID:undefined});
              quitDialog();
            }
          }}><Media aria-hidden="true" width="1.5rem" height="1.5rem" stroke="var(--color-6)" name="delete"/>Delete Subject</button>
      </div>
    </form>
  </AlertDialog>

  type.edit_note = () => {
    const default_note = appData.getNoteByID(selectedSubjectID)[selectedNoteIndex];
    return <AlertDialog cancelable title="Edit Note"
      form="form_edit_note"
      primaryButtonText="Save"
      onCloseDialog={()=>quitDialog({selectedNoteIndex:undefined})}
      onApplyDialog={data=>{
        if (data.note !== default_note) {
          appData.writeData('note', appData.getData('note').map(item=>{
            if (item[0] === selectedSubjectID) {
              item[1][selectedNoteIndex] = data.note_key ? [data.note_key, data.note] : data.note;
            }
            return item;
          }), appContext);
        }else {
          return false;
        }
        return data;
      }}>
      <form id="form_edit_note" className="margin-bottom-all-8">
        <Input name="note" type="textarea" label="Note" defaultValue={default_note} required {...note_more_props}/>
        <div>
          <button disabled={appData.getNoteByID(selectedSubjectID).length <= 1} type="button" onClick={()=>{
            appContext.setState({noteMoveMode:true});
            appData.writeData('moving_note', appData.getData('note').filter(item=>item[0] === selectedSubjectID));
            quitDialog();
            }}><Media aria-hidden="true" width="1.5rem" height="1.5rem" name="move"/>Move Note</button>
          <button type="button" style={{color:'var(--color-6)', float:'right'}}
            onClick={()=>{
              if (window.confirm('Are you sure you want to delete this note?')) {
                appData.writeData('note', appData.getData('note').map(item=>{
                  if (item[0] === selectedSubjectID) {
                    item[1] = item[1].filter((item, index)=>index !== selectedNoteIndex);
                  }
                  return item;
                }).filter(item=>item[1].length > 0), appContext);
                quitDialog();
              }
            }}><Media aria-hidden="true" width="1.5rem" height="1.5rem" stroke="var(--color-6)" name="delete"/>Delete Note</button>
        </div>
      </form>
    </AlertDialog>
  };

  type.settings = () => {
    return <AlertDialog cancelable title="Settings"
      form="form_settings"
      primaryButtonText="Save"
      onCloseDialog={quitDialog}
      onApplyDialog={data=>{
        if (data) {
          appData.setCustom(data);
          document.body.setAttribute('data-dark-mode',data.dark_mode);
        }
        return data;
      }}>
      <form id="form_settings">
        <Fragment>
          <Fragment.View title="File" style={{display:'grid', gridTemplateColumns:'49% 49%', gap:'16px 2%', gridTemplateAreas:'"top-left top-right" "bottom bottom"'}}>
            <button type="button" onClick={()=>{
                appData.downloadProjectData();
                quitDialog();
              }} disabled={appData.getData('subject').length === 0} style={{gridArea:'top-left'}}><Media name="save" width="1.25rem" height="1.25rem" aria-hidden="true"/>Download Project</button>
            <button type="button" onClick={()=>{
                if (window.confirm('Are you sure to create new project? If you don\'t download this project you will lose all data.')) {
                  window.localStorage.removeItem('subject');
                  window.localStorage.removeItem('note');
                  appContext.setState({selectedSubjectID:undefined});
                  quitDialog();
                }
              }} style={{gridArea:'top-right'}}><Media name="blank" height="1.25rem" aria-hidden="true"/>New Project</button>
            <button type="button" onClick={()=>{
                appData.loadProjectData(data=>{
                  appData.writeData('custom', data.custom);
                  appData.writeData('subject', data.subject);
                  appData.writeData('note', data.note);
                  window.location.reload();
                });
              }} className="fill" style={{gridArea:'bottom'}}><Media name="load" stroke="var(--color-2)" width="1.25rem" height="1.25rem" aria-hidden="true"/>Load Project</button>
          </Fragment.View>
          <Fragment.View title="Main">
            <label style={{position:'fixed', top:'8px', right:'16px'}}>Version: 1.0</label>
            <div className="margin-bottom-16" style={{display:'grid', gridTemplateColumns:'49% 49%', columnGap:'2%', rowGap:'12px'}}>
              <Input name="max_note_length" min="8" max="128" type="number" label="Max note length" customDescription="Enter max note length per page." defaultValue={appData.getMaxNoteLength()} required/>
              <Input name="dark_mode" label="Dark mode" customDescription="You can change manually." type="select" defaultValue={appData.getDarkMode()}
                options={[
                  {value:'auto', text:'Auto'},
                  {value:'light', text:'Light'},
                  {value:'dark', text:'Dark'}
                ]}/>
            </div>
            <a className="text-center margin-bottom-8" href="https://github.com/ytdmr" target="_blank" rel="noreferrer">
                <label>Created By:</label>
                Yiğit Demir
            </a>
            <a className="text-center" href="https://github.com/ytdmr/quicknote" target="_blank" rel="noreferrer">
                  <label>Do you want help us develop this app?</label>
                  GitHub Repository
              </a>
          </Fragment.View>
        </Fragment>
      </form>
    </AlertDialog>
  };

  return type[alertDialog]?.();
};

export default CheckAlertDialogs;