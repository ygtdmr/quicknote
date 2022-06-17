const appData = {
  isMobile: window.innerWidth <= 1024,
  isSafari: /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)),
  getData: (type, isUndefined) => {
    return JSON.parse(window.localStorage.getItem(type)) ?? (isUndefined ? undefined : []);
  },
  writeData: (type, data, component) => {
    if (Object.keys(data).length && Object.values(data).filter(e=>e !== undefined).length) {
      window.localStorage.setItem(type, JSON.stringify(data));
    }else {
      window.localStorage.removeItem(type);
    }
    if (component) {
      component.forceUpdate();
    }
  },
  getNoteByID: id => {
    return (window.localStorage.getItem('moving_note') ? appData.getData('moving_note') : appData.getData('note')).find(note_item=>note_item[0] === id)?.[1] ?? [];
  },
  setCustom: properties => {
    const custom = appData.getData('custom');
    appData.writeData('custom', Object.assign(Array.isArray(custom) ? {} : custom, properties));
  },
  getMaxNoteLength: () => {
    return appData.getData('custom').max_note_length ?? 48;
  },
  getDarkMode: () => {
    return appData.getData('custom').dark_mode ?? 'auto';
  },
  getLastSelectedSubjectID: () => {
    return appData.getData('custom').last_selected_subject_id;
  },
  getLastMore: () => {
    return appData.getData('custom').last_more ?? [];
  },
  getNotePageCountByID: id => {
    return Math.floor(id !== undefined ? (appData.getNoteByID(id).length - 1) / appData.getMaxNoteLength() : 0);
  },
  removeNoteByID: id => {
    var ids = [];
    [appData.getSubjectByID(id)].getInner(parent=>{
      ids = ids.concat(parent.map(item=>item[0]));
      return parent;
    });
    return appData.getData('note').filter(note_item=>!ids.includes(note_item[0]));
  },
  addNoteByID: (id, value) => {
    if (appData.getData('note').some(note_item=>note_item[0] === id)) {
      return appData.getData('note').map(note=>{
        if (note[0] === id) {
          note[1].push(value);
        }
        return note;
      });
    }else {
      return [...appData.getData('note'), [id, [value]]];
    }
  },
  getNewSubjectID: () => {
    var new_id = 0;
    const ids = [];
    appData.getData('subject').getInner(parent=>{
      parent.forEach(e=>ids.push(e[0]));
    });
    ids.sort((a,b)=>a-b);
    ids.forEach(current_id=>{
      if (new_id === current_id) {
        new_id ++;
      }
    });
    return new_id;
  },
  getSubjectByID: id => {
    var subject = undefined;
    appData.getData('subject').getInner(parent=>{
      const result = parent.find(e=>e[0] === id);
      if (result) {
        subject = result;
      }
      return parent;
    });
    return subject;
  },
  removeSubjectByID: id => {
    return appData.getData('subject')
    .getInner(parent=>parent
      .filter(e=>e[0] !== id)
      .map(item=>item[2]?.length === 0 ? item.slice(0,2) : item))
  },
  addSubject: (new_item, target_id, inside) => {
    return appData.getData('subject').getInner(parent=>{
      const target_item = parent.find(e=>e[0] === target_id);
      if (target_item) {
        if (inside) {
          if (!Array.isArray(target_item[2])) {
            target_item[2] = [];
          }
          target_item[2].push(new_item);
        }else {
          parent.push(new_item);
        }
      }
      return parent;
    });
  },
  downloadProjectData: () => {
    const download_tag = document.createElement('a');
    download_tag.setAttribute('href',
      'data:text/json;charset=utf-8,' + window.encodeURIComponent(JSON.stringify({
          custom: appData.getData('custom', true),
          subject: appData.getData('subject', true),
          note: appData.getData('note', true)
       }))
    );
    download_tag.setAttribute('download', 'project.quicknote');
    download_tag.click();
  },
  loadProjectData: onLoad => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.quicknote';
    input.onchange = () => {
      const reader = new FileReader();
      reader.onload = () => {
        onLoad(JSON.parse(reader.result));
      };
      reader.readAsText(input.files[0]);
    };
    input.click();
  }
};

export default appData;