import React from 'react'

class AlertDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isQuit:false};
    this.getFormDataAlert = this.getFormDataAlert.bind(this);
    this.dialogDocument = React.createRef();
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden';
    this.alertdialog_key_up = e => {
      if (e.key === 'Escape' && this.props.cancelable) {
        this.quitDialog();
        e.preventDefault();
      }
    };
    this.alertdialog_key_down = e => {
      if (e.key === 'Tab') {
        const focusable_items = Array.from(this.dialogDocument.current.querySelectorAll('*')).filter(e=>e.tabIndex !== -1);
        if (!focusable_items.includes(e.target) || (focusable_items.indexOf(e.target) + 1 === focusable_items.length && !e.shiftKey)) {
          focusable_items[0].focus();
          e.preventDefault();
        }else if (focusable_items.indexOf(e.target) === 0 && e.shiftKey) {
          focusable_items.slice(-1)[0].focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keyup',this.alertdialog_key_up);
    window.addEventListener('keydown',this.alertdialog_key_down);
  }

  componentWillUnmount(){
    document.body.style.overflow = '';
    window.removeEventListener('keyup',this.alertdialog_key_up);
    window.removeEventListener('keydown',this.alertdialog_key_down);
  }

  componentDidUpdate() {
    if (this.state.isQuit) {
      setTimeout(this.props.onCloseDialog,250);
    }
  }

  quitDialog(ignore) {
    if (!this.props.ignoreWarning) {
      const isWriting = Array.from(this.dialogDocument.current.querySelectorAll('input:not([type="hidden"], [type="checkbox"]), textarea, select')).find(e=> e.value !== '' && e.getAttribute('data-default-value') !== e.value) !== undefined
      if (!ignore && isWriting && !window.confirm('Are you sure leave this dialog? if leave this dialog, will delete some changes.')) {
        return;
      }
    }
    this.setState({isQuit:true});
  }

  getFormDataAlert() {
    const data = {};
    if (this.props.form) {
      if (document.forms[this.props.form].action === window.location.href || !document.forms[this.props.form].action) {
        document.forms[this.props.form].onsubmit = () => false;
      }
      if (document.forms[this.props.form].checkValidity()) {
        for (var [key, value] of new FormData(document.forms[this.props.form]).entries()) {
          data[key] = value;
        }
      }
    }
    return Object.keys(data).length > 0 ? data : false;
  }

  render () {
    const {title, children, cancelable, cancelButtonText, primaryButtonText, secondaryButtonText, form} = this.props;
    return (
      <span role="alertdialog" style={this.state.isQuit ? {animationName:'fadeOut'} : undefined} onMouseDown={e=>{
          if (this.props.cancelable && e.target.getAttribute('role') === 'alertdialog') {
            this.quitDialog();
          }
        }}>
        <div role="document" ref={this.dialogDocument}>
          {title === false ? undefined : title === undefined || title === true ? <h3>Warning</h3> : <h3>{title}</h3>}
          {children ? children : undefined}
          <div className="buttons">
            {cancelable ? (<button style={secondaryButtonText ? {float:'left'} : undefined} onClick={()=>this.quitDialog()}>{cancelButtonText ? cancelButtonText : 'Cancel'}</button>) : undefined}
            {secondaryButtonText ?
              (<button form={form}
                  onClick={()=>{
                    if (this.props.onSecondaryApplyDialog ? this.props.onSecondaryApplyDialog(this.getFormDataAlert()) : true) {
                      this.quitDialog(true);
                    }
                  }}>{secondaryButtonText}</button>)
              : undefined}
            <button form={form}
                onClick={()=>{
                  if (this.props.onApplyDialog ? this.props.onApplyDialog(this.getFormDataAlert()) : true) {
                    this.quitDialog(true);
                  }
                }}>{primaryButtonText ? primaryButtonText : cancelable ? 'Apply' : 'Okay'}</button>
          </div>
        </div>
      </span>
    );
  }
}

export default AlertDialog;



