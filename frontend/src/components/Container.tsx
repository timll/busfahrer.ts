import React from 'react';

const Container = (props: { children: React.ReactNode }): JSX.Element => {
  return <div className="container">{props.children}</div>;
};

export default Container;
