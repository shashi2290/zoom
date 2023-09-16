/* eslint-disable no-restricted-globals */
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Card, Button } from 'antd';
import { IconFont } from '../../component/icon-font';
import './home.scss';

const { Meta } = Card;
interface HomeProps extends RouteComponentProps {
  status: string;
  meetLink: string;
  role?: number;
  onLeaveOrJoinSession: () => void;
}
const Home: React.FunctionComponent<HomeProps> = (props) => {
  const { history, status, onLeaveOrJoinSession, meetLink, role } = props;
  const onCardClick = (type: string) => {
    if (type === "meet-link") {
      const urlObj = new URL(meetLink);
      urlObj.searchParams.set('role', '0');
      let attendeeMeetLink = urlObj.toString();
      navigator.clipboard.writeText(attendeeMeetLink);
      // history.push('video')
      // window.location.href = attendeeMeetLink;
      return
    }
    history.push(`/${type}${location.search}`);
  };
  if (role) {
    localStorage.setItem('role', "HOST")
    localStorage.setItem('name', "HOST")
  }
  useEffect(() => {
    if(!role) {
      history.push('/video')
    }
  }, [role])

  const featureList = [
    {
      key: 'video',
      icon: 'icon-meeting',
      title: 'Meeting Session',
      description: 'Click on this card to join the meet session...'
    },
    {
      key: 'meet-link',
      icon: 'icon-share',
      title: 'Copy meet Link and share with Attendees',
      description: 'Copy this meet link to share with other to join session'
    }
  ];
  let actionText;
  if (status === 'connected') {
    actionText = 'Leave';
  } else if (status === 'closed') {
    actionText = 'Join';
  }
  return (
    <div>
      <div className="nav">
        {actionText && (
          <Button type="link" className="navleave" onClick={onLeaveOrJoinSession}>
            {actionText}
          </Button>
        )}
      </div>

      <div className="home">
        <h1>Zoom Video MEET Demo</h1>
        <div className="feature-entry">
          {featureList.map((feature) => {
            const { key, icon, title, description } = feature;
            return (
              <Card
                cover={<IconFont style={{ fontSize: '72px' }} type={icon} />}
                hoverable
                style={{ width: 320 }}
                className="entry-item"
                key={key}
                onClick={() => onCardClick(key)}
              >
                <Meta title={title} description={description} />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Home;
