import React from 'react';

const Player = (props: {
  id: string;
  name: string;
  imgUrl?: string;
  isAdmin: boolean;
  isSelf: boolean;
  showAdmin: boolean;
  onAdminClick: (name: string) => void;
  onXClick: (name: string) => void;
}): JSX.Element => {
  let sub;

  if (props.showAdmin) {
    if (props.isSelf) sub = <small className="small">Du bist Lobby Leader</small>;
    else
      sub = (
        <button className="small pseudo no-pad" onClick={() => props.onAdminClick(props.id)}>
          Übergebe Lobby Leader
        </button>
      );
  } else {
    if (props.isSelf) sub = <small className="small">Du</small>;
    if (props.isAdmin) sub = <small className="small">Lobby Leader</small>;
  }

  return (
    <div className="player-profile">
      {props.imgUrl !== '' && <img src={props.imgUrl} alt="Profile" />}
      <div>
        <h4>
          {props.name}{' '}
          {props.showAdmin && !props.isSelf && (
            <button className="small square-pad error ml-1" onClick={() => props.onXClick(props.id)}>
              x
            </button>
          )}
        </h4>
        {sub}
      </div>
    </div>
  );
};

export default Player;
