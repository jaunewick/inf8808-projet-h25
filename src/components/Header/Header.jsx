import React from "react";

import classes from "./Header.module.css";

export const Header = () => {
  return (
    <div className={classes.header}>
      <h1 className={classes.title}>Titanic : Auriez-vous le Bon Billet?</h1>
      <p className={classes.subtitle}>
        Analyse des probabilités de survie selon la classe et la position sur le
        bateau.
      </p>
      <div className={classes.logo}>
        <img src="/path/to/logo.png" alt="Logo" />
      </div>
    </div>
  );
};
