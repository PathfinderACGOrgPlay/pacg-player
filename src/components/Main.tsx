import React, { MouseEvent, useState } from "react";
import {
  AppBar,
  Avatar,
  Button,
  CssBaseline,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase";
import { Redirect, Route } from "react-router";
import { Characters } from "./Characters";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  photo: {
    display: "inline-block",
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginBottom: theme.spacing(0.75) * -1,
    marginRight: theme.spacing(0.25),
  },
  menu: {
    marginTop: theme.spacing(4),
  },
}));

export function Main() {
  const classes = useStyles();
  const [user] = useAuthState(firebase.auth());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar className={classes.toolbar}>
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            className={classes.toolbarTitle}
          >
            Pathfinder Adventure Card Game
          </Typography>
          <nav>
            <Link
              variant="button"
              color="textPrimary"
              href="#"
              component={RouterLink}
              to="/characters"
              className={classes.link}
            >
              Characters
            </Link>
            <Link
              variant="button"
              color="textPrimary"
              href="#"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={(event: MouseEvent<HTMLElement>) => {
                setAnchorEl(event.currentTarget);
              }}
              className={classes.link}
            >
              {user!.photoURL ? (
                <Avatar
                  alt={""}
                  src={user!.photoURL}
                  className={classes.photo}
                />
              ) : null}
              {user!.displayName}
            </Link>
          </nav>
          <Menu
            id="user-menu"
            className={classes.menu}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                firebase.auth().signOut();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Route exact path={"/"}>
        <Redirect to={"/characters"} />
      </Route>
      <Route component={Characters} path={"/characters"} />
    </>
  );
}
