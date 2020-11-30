import React from 'react';

const SplitLayout = (props: { children: React.ReactNode[] }): JSX.Element => {
  return (
    <div className="flex two">
      {React.Children.toArray(props.children).map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </div>
  );
};

export default SplitLayout;
