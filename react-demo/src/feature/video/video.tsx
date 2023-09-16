import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import Pagination from './components/pagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useShare } from './hooks/useShare';
import { useLocalVolume } from './hooks/useLocalVolume';
import './video.scss';
import { isShallowEqual } from '../../utils/util';
import { useSizeCallback } from '../../hooks/useSizeCallback';
import { useAdvancedFeatureSwitch } from './hooks/useAdvancedFeatureSwith';
import RemoteControlPanel, { RemoteControlIndication } from './components/remote-control';
import { useCameraControl } from './hooks/useCameraControl';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import ReportBtn from './components/report-btn';
import { Button, Drawer, DrawerProps, Space, notification } from 'antd';
import { NotificationPlacement } from 'antd/lib/notification';
import { LoremIpsum } from 'lorem-ipsum';

interface VideoProps extends RouteComponentProps {
  role?: number;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0
  });
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0
  });
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize
    }
  );
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);

  const { userVolumeList, setLocalVolume } = useLocalVolume();
  const {
    isControllingFarEnd,
    currentControlledUser,
    isInControl,
    giveUpControl,
    stopControl,
    turnDown,
    turnRight,
    turnLeft,
    turnUp,
    zoomIn,
    zoomOut,
    switchCamera
  } = useCameraControl(zmClient, mediaStream);

  const { advancedSwitch, toggleAdjustVolume, toggleFarEndCameraControl } = useAdvancedFeatureSwitch(
    zmClient,
    mediaStream,
    visibleParticipants
  );
  const networkQuality = useNetworkQuality(zmClient);

  const isSharing = isRecieveSharing || isStartedShare;

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');

  const showDrawer = () => {
    setOpen(true);
  };

  // const onChange = (e:) => {
  //   setPlacement(e.target.value);
  // };

  const onClose = () => {
    setOpen(false);
  };

  const [api, contextHolder] = notification.useNotification();
  let notifyMessage = ''
  const openNotification = () => {
    api.info({
      message: `New Notification`,
      description: notifyMessage,
      placement: 'topRight',
    });
  };

  const createNotification = () => {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 16,
        min: 4
      }
    });
    notifyMessage = lorem.generateSentences(3);
    if(props.role) {
      openNotification();
    }
  }

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      createNotification()
    }, 30000);

    return () => { clearInterval(notificationInterval) }
  }, [])

  useEffect(() => {
    if (isSharing && shareContainerRef.current) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerDimension;
      const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
      setShareViewDimension({
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio)
      });
    }
  }, [isSharing, sharedContentDimension, containerDimension]);

  const onShareContainerResize = useCallback(({ width, height }) => {
    _.throttle(() => {
      setContainerDimension({ width, height });
    }, 50)();
  }, []);
  useSizeCallback(shareContainerRef.current, onShareContainerResize);
  useEffect(() => {
    if (!isShallowEqual(shareViewDimension, sharedContentDimension)) {
      mediaStream?.updateSharingCanvasDimension(shareViewDimension.width, shareViewDimension.height);
    }
  }, [mediaStream, sharedContentDimension, shareViewDimension]);
  const onAdvancedFeatureToggle = useCallback(
    (userId: number, key: string) => {
      if (key === 'volume') {
        toggleAdjustVolume(userId);
      } else if (key === 'farend') {
        if (isControllingFarEnd) {
          giveUpControl();
        } else {
          mediaStream?.requestFarEndCameraControl(userId);
        }
        // toggleFarEndCameraControl(userId);
      }
    },
    [toggleAdjustVolume, giveUpControl, mediaStream, isControllingFarEnd]
  );
  return (
    <div className="viewport">
      {contextHolder}
      <div
        className={classnames('share-container', {
          'in-sharing': isSharing
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${shareViewDimension.width}px`,
            height: `${shareViewDimension.height}px`
          }}
        >
          <canvas className={classnames('share-canvas', { hidden: isStartedShare })} ref={shareRef} />
          {mediaStream?.isStartShareScreenWithVideoElement() ? (
            <video
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={classnames('video-container', {
          'in-sharing': isSharing
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const { width, height, x, y } = dimension;
            const { height: canvasHeight } = canvasDimension;
            return (
              <Avatar
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                volume={userVolumeList.find((u) => u.userId === user.userId)?.volume}
                setLocalVolume={setLocalVolume}
                advancedFeature={advancedSwitch[`${user.userId}`]}
                onAdvancedFeatureToggle={onAdvancedFeatureToggle}
                isUserCameraControlled={isControllingFarEnd}
                networkQuality={networkQuality[`${user.userId}`]}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`
                }}
              />
            );
          })}
        </ul>
      </div>
      <VideoFooter className="video-operations" sharing shareRef={selfShareRef} />
      {isControllingFarEnd && (
        <RemoteControlPanel
          turnDown={turnDown}
          turnLeft={turnLeft}
          turnRight={turnRight}
          turnUp={turnUp}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          switchCamera={switchCamera}
          controlledName={currentControlledUser.displayName}
        />
      )}
      {isInControl && <RemoteControlIndication stopCameraControl={stopControl} />}
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isSharing} />}
      {/* <ReportBtn /> */}
      {props.role &&  <Button type="primary" onClick={showDrawer}>
          Profile
        </Button>}
      <Drawer
        title="Attendees List"
        placement={placement}
        width={500}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onClose}>
              OK
            </Button>
          </Space>
        }
      >
        {visibleParticipants.filter(p => !p.isHost).map((p, idx) => (<p key={p.userId} >{`${idx+1}. ${p.displayName}`}</p>))}
      </Drawer>
    </div>
  );
};

export default VideoContainer;
