import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { 
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@material-ui/core';

import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import ConfirmDialog from '../shared/ConfirmDialog';


const styles = {
    dialog: {
        width: 320,
    },
    deleteButton: {
        marginRight: 'auto',
    },
    roleSelect: {
        marginTop: 15,
    },
    spinner: {
        position: 'fixed',
    },
};

const initialState = {
    addApi: {
        isExecuting: false,
        isErrored: false,
    },
    deleteApi: {
        isExecuting: false,
        isErrored: false,
    },
    updateApi: {
        isExecuting: false,
        isErrored: false,
    },
    account: {
        name: '',
        role: 'User',
        password: '',
        password2: '',
    },
    validation: {
        name: undefined,
        role: undefined,
        password: undefined,
        password2: undefined,
    },
    snackbar: {
        message: '',
        open: false,
    },
    confirmDialog: {
        open: false,
    },
}

class AccountDialog extends Component {
    state = initialState;



    componentWillReceiveProps = (nextProps) => {
        if (nextProps.open && !this.props.open) {
            this.setState({ 
                ...initialState, 
                account: nextProps.account ? nextProps.account : { 
                    ...initialState.account, 
                },
                validation: initialState.validation,
            });
        }
    }

    handleChange = (field, event) => {
        this.setState({ 
            account: {
                ...this.state.account,
                [field]: event.target.value,
            },
            validation: {
                ...this.state.validation,
                [field]: undefined,
            },
        });
    }

    handleCancelClick = () => {
        this.props.onClose();
    }

    handleSaveClick = () => {
        this.validate().then(result => {
            if (result.isValid) {
                if (this.props.intent === 'add') {
                    this.execute(
                        () => this.props.addAccount({ ...this.state.account }),
                        'addApi', 
                        'Account \'' + this.state.account.name + '\' successfully created.'
                    )
                }
                else {
                    this.execute(
                        () => this.props.updateAccount({ ...this.state.account }), 
                        'updateApi', 
                        'Account \'' + this.state.account.name + '\' successfully updated.'
                    );
                }
            }
        });
    }

    handleError = (error, api) => {
        var body = error && error.response && error.response.data ? error.response.data : error;
    
        this.setState({ 
            [api]: { isExecuting: false, isErrored: true },
            snackbar: {
                message: body[Object.keys(body)[0]],
                open: true,
            },
        });
    }

    handleDialogClose = (result) => {
        this.setState({ confirmDialog: { open: false }});
    }

    handleDeleteClick = () => {
        this.setState({ confirmDialog: { open: true }});
    }

    handleDeleteConfirmation = () => {
        return this.execute(
            () => this.props.deleteAccount({ ...this.state.account }), 
            'deleteApi', 
            'Account \'' + this.state.account.name + '\' successfully deleted.'
        );
    }

    execute = (action, api, successMessage) => {
        return new Promise((resolve, reject) => {
            this.setState({ [api]: { isExecuting: true }}, () => {
                action(this.state.account)
                .then(response => {
                    this.setState({
                        [api]: { isExecuting: false, isErrored: false }
                    }, () => {
                        this.props.onClose(successMessage);
                        resolve(response);
                    })
                }, error => {
                    var body = error && error.response && error.response.data ? error.response.data : error;

                    // var keys = Object.keys(body);

                    // if (keys.length > 0) {
                    //     body = body[keys[0]];
                    // }
    
                    this.setState({ 
                        [api]: { isExecuting: false, isErrored: true },
                        snackbar: {
                            message: JSON.stringify(body),
                            open: true,
                        },
                    }, () => reject(error));
                })
            })
        })
    }

    validate = () => {
        console.log(this.state.account)
        let { name, role, password, password2 } = this.state.account;
        let result = { ...initialState.validation };

        if (name === '') {
            result.name = 'The Name field is required.';
        }

        if (role === '') {
            result.role = 'Select a Role.';
        }

        if (this.props.intent === 'add') {
            if (password === '') {
                result.password = 'The Password field is required.';
            }

            if (password2 === '') {
                result.password2 = 'The Confirm Password field is required.';
            }

            if (password !== '' && password2 !== '' && password !== password2) {
                result.password = result.password2 = 'The Password fields must match.';
            }
        }

        return new Promise(resolve => {
            this.setState({ validation: result }, () => {
                result.isValid = JSON.stringify(result) === JSON.stringify(initialState.validation);
                resolve(result);
            });                
        })
    }

    handleSnackbarClose = () => {
        this.setState({ snackbar: { open: false }});
    }

    render() {
        let { classes, intent, open } = this.props;
        let { name, role } = this.state.account;
        let validation = this.state.validation;

        let adding = this.state.addApi.isExecuting;
        let updating = this.state.updateApi.isExecuting;
        let deleting = this.state.deleteApi.isExecuting;

        
        let executing = adding || updating || deleting;
        
        return (
            <Dialog 
                open={open}
                onClose={this.handleCancel}
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle>{(intent === 'add' ? 'Add' : 'Update')} Account</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        id="name"
                        label="Name"
                        value={name}
                        type="text"
                        fullWidth
                        onChange={(event) => this.handleChange('name', event)}
                        helperText={validation.name}
                        error={validation.name !== undefined}
                        disabled={executing}
                    />
                    <FormControl 
                        className={classes.roleSelect}
                        fullWidth
                        disabled={executing}
                    >
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            onChange={(event) => this.handleChange('role', event)}
                            fullWidth
                        >
                            <MenuItem value={'User'}>User</MenuItem>
                            <MenuItem value={'Supervisor'}>Supervisor</MenuItem>
                            <MenuItem value={'Administrator'}>Administrator</MenuItem>
                        </Select>
                    </FormControl>
                    {intent !== 'add' ? '' : 
                        <div>
                            <TextField
                                style={{marginTop: 30}}
                                id="password"
                                label="Password"
                                type="password"
                                error={validation.password !== undefined}
                                helperText={validation.password}
                                fullWidth
                                onChange={(event) => this.handleChange('password', event)}
                                disabled={executing}
                            />
                            <TextField
                                style={{marginTop: 15}}
                                id="password2"
                                label="Confirm Password"
                                type="password"
                                error={validation.password2 !== undefined}
                                helperText={validation.password2}
                                fullWidth
                                onChange={(event) => this.handleChange('password2', event)}
                                disabled={executing}
                            />
                        </div>
                    }
                </DialogContent>
                <DialogActions>
                    {intent === 'update' && 
                        <Button 
                            onClick={this.handleDeleteClick} 
                            color="primary" 
                            className={classes.deleteButton}
                            disabled={executing}
                        >
                            {deleting && <CircularProgress size={20} style={styles.spinner}/>}
                            Delete
                        </Button>
                    }
                    <Button 
                        onClick={this.handleCancelClick}
                        color="primary"
                        disabled={executing}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={this.handleSaveClick} 
                        color="primary"
                        disabled={executing}
                    >
                        {(adding || updating) && <CircularProgress size={20} style={styles.spinner}/>}
                        Save
                    </Button>
                </DialogActions>
                <ConfirmDialog
                    title={'Confirm Account Deletion'}
                    prompt={'Delete'}
                    open={this.state.confirmDialog.open}
                    onConfirm={this.handleDeleteConfirmation}
                    onClose={this.handleDialogClose}
                    suppressCloseOnConfirm
                >
                    <p>Are you sure you want to delete account '{this.state.account.name}'?</p>
                </ConfirmDialog>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
                    open={this.state.snackbar.open}
                    onClose={this.handleSnackbarClose}
                    autoHideDuration={3000}
                    message={<span id="message-id">{this.state.snackbar.message}</span>}
                />
            </Dialog>
        );
    }
}

AccountDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    intent: PropTypes.oneOf([ 'add', 'update' ]).isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    account: PropTypes.object,
    addAccount: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired,
    updateAccount: PropTypes.func.isRequired,
};

export default withStyles(styles)(AccountDialog); 