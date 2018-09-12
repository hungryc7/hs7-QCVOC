/*
    Copyright (c) QC Coders (JP Dillingham, Nick Acosta, Will Burklund, et. al.). All rights reserved. Licensed under the GPLv3 license. See LICENSE file
    in the project root for full license information.
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../api';

import { withStyles } from '@material-ui/core/styles';
import ContentWrapper from '../shared/ContentWrapper';
import Snackbar from '@material-ui/core/Snackbar';
import { Card, CardContent, Typography, CircularProgress, ListSubheader } from '@material-ui/core';
import { EventAvailable, Event, Today } from '@material-ui/icons';
import EventList from './EventList';

const styles = {
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
        zIndex: 1000
    },
    card: {
        minHeight: 220,
        maxWidth: 800,
        margin: 'auto',
    },
    refreshSpinner: {
        position: 'fixed',
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 68,
    },
};

const showCount = 4;

class Events extends Component {
    state = {
        events: [],
        loadApi: {
            isExecuting: false,
            isErrored: false,
        },
        refreshApi: {
            isExecuting: false,
            isErrored: false,
        },
        snackbar: {
            message: '',
            open: false,
        },
        show: showCount
    }

    componentWillMount = () => {
        this.refresh('refreshApi');
    }

    handleEditClick = (event) => {
        console.log(event);
    }

    handleSnackbarClose = () => {
        this.setState({ snackbar: { open: false }});
    }

    refresh = (apiType) => {
        this.setState({ [apiType]: { ...this.state[apiType], isExecuting: true }}, () => {
            api.get('/v1/events?offset=0&limit=100&orderBy=ASC')
            .then(response => {
                this.setState({ 
                    events: response.data,
                    [apiType]: { isExecuting: false, isErrored: false },
                });
            }, error => {
                this.setState({ 
                    [apiType]: { isExecuting: false, isErrored: true },
                    snackbar: { message: error.response.data.Message, open: true },
                });
            });
        })
    }

    render() {
        let classes = this.props.classes;
        let { events, loadApi, refreshApi, snackbar } = this.state;

        events = events.map(e => ({ ...e, startDate: new Date(e.startDate).getTime(), endDate: new Date(e.endDate).getTime() }))

        let now = new Date().getTime();

        let current = events.filter(e => e.startDate <= now && e.endDate >= now);
        let past = events.filter(e => e.endDate < now);
        let upcoming = events.filter(e => e.startDate > now);

        return (
            <div className={classes.root}>
                <ContentWrapper api={loadApi}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography gutterBottom variant="headline" component="h2">
                                Events
                            </Typography>
                            {refreshApi.isExecuting ?
                                <CircularProgress size={30} color={'secondary'} className={classes.refreshSpinner}/> :
                                <div>
                                    <ListSubheader>Current</ListSubheader>
                                    <EventList
                                        events={current}
                                        icon={<Today/>}
                                        onItemClick={this.handleEditClick}
                                    />
                                    <ListSubheader>Upcoming</ListSubheader>
                                    <EventList
                                        events={upcoming}
                                        icon={<Event/>}
                                        onItemClick={this.handleEditClick}
                                    />
                                    <ListSubheader>Past</ListSubheader>
                                    <EventList
                                        events={past}
                                        icon={<EventAvailable/>}
                                        onItemClick={this.handleEditClick}
                                    />
                                </div>
                            }
                        </CardContent>
                    </Card>
                </ContentWrapper>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
                    open={snackbar.open}
                    onClose={this.handleSnackbarClose}
                    autoHideDuration={3000}
                    message={<span id="message-id">{snackbar.message}</span>}
                />
            </div>
        );
    }
}

Events.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Events); 