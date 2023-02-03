import React from 'react';
import { Box, Typography, withStyles } from '@material-ui/core'
import {
  FormattedMessage, FormattedNumber, FormattedDate, FormattedTime, injectIntl
} from 'react-intl';

import PropTypes from 'prop-types';

import FavoriteIconSelected from '@material-ui/icons/Favorite';
import FavoriteIcon from '@material-ui/icons/FavoriteBorder';
import boxStyle from '../style/boxStyle';
import Card from '../../../component/card/Card';
import CardHeader from '../../../component/card/CardHeader';
import CardIcon from '../../../component/card/CardIcon';
import CardFooter from '../../../component/card/CardFooter';
import Button from '../../../component/customButtons/Button';
import { DateRange, Pause, PlayArrow, Stop } from '@material-ui/icons'
import Print from '@material-ui/icons/Print'

import LinearProgress from '@material-ui/core/LinearProgress';
import CardBody from '../../../component/card/CardBody'
import { printPause, printResumeStart, printStop } from '../../../redux/additions/commands'

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
  },
}))(LinearProgress);

class InformativeRealtimeBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      remainingSeconds: null
    }
  }

  componentDidMount () {
    this.props.subscription();
  }

  componentWillUnmount () {
    this.props.unsubscription();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.percentageProgress !== 0 &&
      prevProps.percentageProgress != null && prevProps.percentageProgress != undefined &&
      this.props.percentageProgress != null && this.props.percentageProgress != undefined &&
      prevProps.progressTime != null && prevProps.progressTime != undefined &&
      (prevProps.progressTime.seconds != this.props.progressTime.seconds ||
        prevProps.progressTime.minutes != this.props.progressTime.minutes ||
      prevProps.progressTime.hours != this.props.progressTime.hours)
      // && this.props.percentageProgress != prevProps.percentageProgress
    ) {
      let elapsedSeconds = this.props.progressTime.hours * 60 *60 + this.props.progressTime.minutes * 60 + this.props.progressTime.seconds;

      // 100 : this.props.percentageProgress = x : elapsedSeconds

      let remainingSeconds = (100 * elapsedSeconds / this.props.percentageProgress)-elapsedSeconds;
      if (remainingSeconds<0) remainingSeconds = 0;
      remainingSeconds = Math.round(remainingSeconds);

      if (this.props.value === 'IDLE' && this.props.percentageProgress === 99){
        this.setState({ remainingSeconds: 0 });
      } else {
        this.setState({ remainingSeconds: remainingSeconds });
      }
    }
    // if (
    //   prevProps.value==='PRINTING' &&
    //   this.props.value!=='IDLE' &&
    //   this.props.value!=='PAUSE' &&
    //   this.props.value!=='PRINTING'
    // ) {
    //   this.setState({ remainingSeconds: 0 });
    // }
  }

  handleHome = () => {
    const {
      isInHome, removeElementFromHome, addElementToHome, boxType,
    } = this.props;
    if (isInHome) {
      removeElementFromHome(boxType);
    } else {
      addElementToHome(boxType);
    }
  };

  handleResume = () => {
    const { webSocketSendMessage } = this.props;
    webSocketSendMessage(printResumeStart());
  }

  handlePause = () => {
    const { webSocketSendMessage } = this.props;
    webSocketSendMessage(printPause());
  }

  handleStop = () => {
    const { webSocketSendMessage } = this.props;
    webSocketSendMessage(printStop());
  }

  render() {
    const { classes, id } = this.props;
    let {
      value, dataType, lastUpdate, isInHome,
      percentageProgress,
      job,
      jobSize,
      progressTime

    } = this.props;

    let resume = false;
    let pause = false;
    let stop = false;

    let remainingTime = { minutes: ' - ', hours: ' - ', seconds: ' - ' }
    if (percentageProgress < 0) percentageProgress = 0;
    if (percentageProgress === 99 && value==='IDLE') {
      percentageProgress = 100;
    }

    if (percentageProgress === 100){
      remainingTime.hours='00';
      remainingTime.minutes='00';
      remainingTime.seconds='00';
    }else if (this.state.remainingSeconds !== null && this.state.remainingSeconds !== undefined){

      remainingTime.hours='';
      remainingTime.minutes='';
      remainingTime.seconds='';

      remainingTime.hours = Math.trunc(this.state.remainingSeconds/60/60).toString().padStart(2, '0');

      let remainingSecondsHours = Math.trunc(this.state.remainingSeconds/60/60)*60*60;

      remainingTime.minutes = (Math.trunc((this.state.remainingSeconds-remainingSecondsHours)/60)).toString().padStart(2, '0');

      let remainingSecondsMinuts = Math.trunc((this.state.remainingSeconds-remainingSecondsHours)/60)*60;

      remainingTime.seconds = (this.state.remainingSeconds-(remainingSecondsHours+remainingSecondsMinuts)).toString().padStart(2, '0');
    }
    // (Math.round(this.state.remainingSeconds/60).toString().padStart(2, '0')||" -")+":"+((this.state.remainingSeconds-Math.round(this.state.remainingSeconds/60)*60).toString().padStart(2, '0')||" -")

    // 'IDLE',
    //   'PRINTING',
    //   'PAUSE',
    //   'NOT CONNECTED',
    //   'WAITING'

    if (jobSize===0){
      resume = false;
      pause = false;
      stop = false;
    } else if (value==='IDLE' || value === 'PAUSE') {
      resume = true;
      pause = false;
      stop = false;
    } else if (value==='PRINTING') {
      resume = false;
      pause = true;
      stop = true;
    } else {
      resume = false;
      pause = false;
      stop = false;
    }

    return (
      <Card>
        <CardHeader color='warning' stats icon>
          <CardIcon color="warning"  className="dragHeader">
            <Print className={classes.icons}/>
          </CardIcon>
          <p className={classes.cardCategory}>
            <FormattedMessage
              id={`informative.realtime.${dataType}.title`}
            />
          </p>
          <h3 className={classes.cardTitle}>
            {value || 'WAITING NO'}
          </h3>

        </CardHeader>
        <CardBody>
          <Box className="mb25" display="flex" alignItems="center" height="30px">
            <Box width="100%" mr={1}>
              <BorderLinearProgress variant="determinate" value={(this.state.remainingSeconds===0 && percentageProgress===99)?100:percentageProgress}  />
            </Box>
            <Box minWidth={40}>
              <Typography variant="body2" color="textSecondary">{`${(this.state.remainingSeconds===0 && percentageProgress===99)?100:percentageProgress}%`}</Typography>
            </Box>
          </Box>
          <Box className="mb25" display="flex" alignItems="center" height="30px">
            <Typography variant="subtitle1" component="div">
              <FormattedMessage
                id="informative.realtime.status.label.file"
              />: {job || '-'}
            </Typography>;
          </Box>
          <Box className="mb25" display="flex" alignItems="center" height="28px">
            <Typography variant="subtitle1" component="div">
              <FormattedMessage
                id="informative.realtime.status.label.size"
              />: {Math.round((jobSize || 0)/10000)/100}Kb
            </Typography>
          </Box>
          <Box className="mb25" display="flex" alignItems="center" height="28px">
            <Typography variant="subtitle1" component="div">
              <FormattedMessage
                id="informative.realtime.status.label.elapsed_time"
              />: {progressTime.hours.toString().padStart(2, '0')}:{progressTime.minutes.toString().padStart(2, '0')}:{progressTime.seconds.toString().padStart(2, '0')}
            </Typography>
          </Box>
          <Box className="mb25" display="flex" alignItems="center" height="28px">
            <Typography variant="subtitle1" component="div">
              <FormattedMessage
                id="informative.realtime.status.label.remaining_time"
              />: {remainingTime.hours+":"+remainingTime.minutes+":"+remainingTime.seconds}
            </Typography>
          </Box>
          <Box className="mb25" display="flex" alignItems="center" justifyContent='space-between'  height="40px">
            <Button
              variant="contained"
              color="success"
              size="sm"
              className={classes.button}
              endIcon={<PlayArrow />}
              disabled={!resume}
              onClick={this.handleResume}
            >
              <FormattedMessage
                id="informative.realtime.status.button.resume"
              />
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="sm"
              className={classes.button}
              endIcon={<Pause />}
              disabled={!pause}
              onClick={this.handlePause}
            >
              <FormattedMessage
                id="informative.realtime.status.button.pause"
              />
            </Button>
            <Button
              variant="contained"
              color="danger"
              size="sm"
              className={classes.button}
              endIcon={<Stop />}
              disabled={!stop}
              onClick={this.handleStop}
            >
              <FormattedMessage
                id="informative.realtime.status.button.stop"
              />
            </Button>
          </Box>
        </CardBody>
        <CardFooter style={{marginTop: 0}} stats>
          <div className={classes.stats}>
            <DateRange />
            <FormattedMessage
              id="last.update"
              defaultMessage="Last update"
            />
            {' '}
            {(lastUpdate) ? [<FormattedDate key={0} value={lastUpdate} />, ' ', <FormattedTime key={1} value={lastUpdate} />] : '-'}
          </div>
          <Button color="transparent" className={classes.buttonFooter} onClick={this.handleHome}>
            {isInHome ? <FavoriteIconSelected /> : <FavoriteIcon />}
          </Button>
        </CardFooter>
      </Card>
    );
  }
}

InformativeRealtimeBox.propTypes = {
  classes: PropTypes.object.isRequired,
  lastUpdate: PropTypes.instanceOf(Date),
  dataType: PropTypes.oneOf([
    'status'
  ]),
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOf([
    'IDLE',
    'PRINTING',
    'PAUSE',
    'NOT CONNECTED',
    'WAITING'
  ]),
  addElementToHome: PropTypes.func.isRequired,
  removeElementFromHome: PropTypes.func.isRequired,
  boxType: PropTypes.string.isRequired,
  isInHome: PropTypes.bool.isRequired,
  subscription: PropTypes.func,
  unsubscription: PropTypes.func,
  webSocketSendMessage: PropTypes.func,
  percentageProgress: PropTypes.number,
  job: PropTypes.string,
  jobSize: PropTypes.number,
  progressTime: PropTypes.object
};
InformativeRealtimeBox.defaultProps = {
  dataType: 'printing',
  color: 'warning',
  value: null,
  lastUpdate: null,
  percentageProgress: 0,
  job: '',
  jobSize: 0,
  progressTime: {hours: 0, minutes: 0, seconds: 0}
};


export default withStyles(boxStyle)(injectIntl(InformativeRealtimeBox));
