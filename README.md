# BugBunnies Website

## Setting up the development environment

### Prerequisits:

Make sure `Docker` and `Docker-Compose` are installed on your system.

### Building the container:

Build the container using the `docker-compose build` command.

### Starting the container:

Start the container using the `docker-compose up -d` command.

### Using the container:

Jekyll is automatically started inside the container and watches for changes. It is set to expose the port 4000 so you can see a preview of the website on `http://localhost:4000/`. The src and dist folders are mounted as volumes into the container. This means changing something inside the project will refresh the server.

> Note: some changes may require to restart the container

### Turning off the container:

Turn off the container by running: `docker-compose down`.

## Adding a new writeup

To add a new writeup article you can add a html or markdown file into the `src/_writeups/<event-name>/` folder, where `<event-name>` stands for the event this writeup belongs to. Make sure your writeup includes the required metadata at the top like so:
```yaml
---
title: "<writeup title>"
author: "<writeup author>"
---
<your markdown or html writeup goes here>
```

## Adding new team-members

A new team-member can be added by creating a markdown file inside the `src/_team_members/` folder. The file should have the following structure:
```yaml
---
name: "<team-member name>"
---
<Short description / funny text about the team-member>
```

## Changing the Theme

> Note: If you want to create your own theming for this website it is probably a good idea to first look at the already existing themes inside `src/_sass/themes/`.

To add your own theme just put it into the `src/_sass/themes/` folder. Import your theme into the `$theme-map` dictionary inside the `src/_sass/themes/index.scss` file. In the `src/_layouts` folder change the `data-theme` property on the root html-element to the name of your new theme.
