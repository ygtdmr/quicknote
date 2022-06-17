import React from 'react'
import media_data from '../data/./media'

const Media = props => {
  const {name, width, height, ...data} = {...props},
  media_props = {...media_data[name].props};
  data.style = {width:width ?? media_data[name].props.width, height:height ?? media_data[name].props.height};
  delete media_props.width;
  delete media_props.height;
  return <svg {...media_props} {...data}/>;
};

export default Media;