import React from 'react'

const Fragment = props => {
  const {ignoreWarning} = props, [view_index, setViewIndex] = React.useState(0);
  var {children} = props;
  if (!Array.isArray(children)) {
    children = [children];
  }
  children = children.filter(e=>e !== undefined);
  if (children.find(e=>e.type !== Fragment.View)) {
    throw new Error('Inside of Fragment should have only component of Fragment.View');
  }
  return (
    <React.Fragment>
      <div role="tablist">
        {children.map((item, index)=>
          <button key={index} type="button" role="tab" tabIndex={view_index !== index ? '-1' : undefined} data-selected={view_index === index ? '' : undefined}
            onClick={e=>{
              if (view_index !== index) {
                if (!ignoreWarning) {
                  const isWriting = Array.from(e.currentTarget.parentElement.nextElementSibling.querySelectorAll('input:not([type="hidden"], [type="checkbox"]), textarea, select')).find(e=>e.value !== '' && e.getAttribute('data-default-value') !== e.value) !== undefined;
                  if (isWriting && !window.confirm('Are you sure leave this tab? if leave this tab, will delete some changes.')) {
                    return;
                  }
                }
                e.currentTarget.parentElement.nextElementSibling.querySelector('input, textarea, select')?.form.reset();
                setViewIndex(index);
              }
            }}
            onKeyDown={e=>{
              switch (e.key) {
                case 'ArrowRight':
                  if (e.target.nextElementSibling) {
                    e.target.nextElementSibling.focus();
                  }else {
                    e.target.parentElement.firstChild.focus();
                  }
                  break;
                case 'ArrowLeft':
                  if (e.target.previousElementSibling) {
                    e.target.previousElementSibling.focus();
                  }else {
                    e.target.parentElement.lastChild.focus();
                  }
                  break;
                default:
              }
            }}>{item.props.title}</button>
        )}
      </div>
      {children[view_index]}
    </React.Fragment>
  );
};

Fragment.View = props => {
  const {title, ...rootProps} = props;
  return (<div role="tabpanel" {...rootProps}/>);
};

export default Fragment;
