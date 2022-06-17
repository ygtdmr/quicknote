const Input = props => {
  if (!props.name) {
    throw new Error('You should assignment value of \'name\'');
  }

  const {customDescription, children, label, options, type, ...root_props} = props;
  const label_id = label ? 'input_label_' + props.name : undefined;
  const description_id = customDescription ? 'input_description_' + props.name : undefined;

  const input = (
    <div role={type === 'checkbox' ? 'checkbox' : 'textbox'}>
      {
        type === 'textarea' ? <textarea placeholder=" " aria-labelledby={label_id} data-default-value={props.defaultValue} {...root_props}></textarea> :
        type === 'select' ?
        <select aria-labelledby={label_id} data-default-value={props.defaultValue} {...root_props}>
          {options && options.length > 0 ?
              [...Array(options.length)].map((e,i)=>(
                <option key={i} value={options[i].value}>{options[i].text}</option>
              ))
             : undefined}
          </select>
         : <input placeholder=" " aria-labelledby={label_id} aria-describedby={description_id} data-default-value={props.defaultValue} type={type??'text'} {...root_props}/>
      }
      {type === 'checkbox' ? <div className="inner"></div> : undefined}
      <label id={label_id}>{label}</label>
      {children}
    </div>
  );
  return customDescription ? (
    <div>
      {input}
      <label id={description_id}>{customDescription}</label>
    </div>
  ) : input;
};

export default Input;