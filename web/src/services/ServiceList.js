/*
    Copyright (c) QC Coders (JP Dillingham, Nick Acosta, Will Burklund, et. al.). All rights reserved. Licensed under the GPLv3 license. See LICENSE file
    in the project root for full license information.
*/
import React from 'react';
import PropTypes from 'prop-types';

import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

const ServiceList = (props) => {
    let { services, onItemClick, icon } = props;
    let clickable = onItemClick !== undefined;

    return (
        <List>
            {services.map(s =>
                <ListItem
                    key={s.id}
                    button={clickable}
                    onClick={clickable ? () => onItemClick(s) : undefined}
                >
                    <ListItemIcon>
                        {icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={s.name}
                        secondary={s.description}
                    />
                </ListItem>
            )}
        </List>
    );
}

ServiceList.propTypes = {
    services: PropTypes.array.isRequired,
    onItemClick: PropTypes.func.isRequired,
    icon: PropTypes.object.isRequired,
};

export default ServiceList;