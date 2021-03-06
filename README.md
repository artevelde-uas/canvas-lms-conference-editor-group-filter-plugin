# Canvas LMS Conference Editor Group Filter Plug-in

[![](https://img.shields.io/npm/v/@artevelde-uas/canvas-lms-conference-editor-group-filter-plugin.svg)](https://www.npmjs.com/package/@artevelde-uas/canvas-lms-conference-editor-group-filter-plugin)
[![](https://img.shields.io/github/license/artevelde-uas/canvas-lms-conference-editor-group-filter-plugin.svg)](https://spdx.org/licenses/MIT)
[![](https://img.shields.io/npm/dt/@artevelde-uas/canvas-lms-conference-editor-group-filter-plugin.svg)](https://www.npmjs.com/package/@artevelde-uas/canvas-lms-conference-editor-group-filter-plugin)

Plugin for the [Canvas LMS theme app](https://github.com/ahsdile/canvas-lms-app) that adds a group filter to the user
selector on the conference editor.

![Example image](docs/example.png)

## Installation

Using NPM:

    npm install @artevelde-uas/canvas-lms-conference-editor-group-filter-plugin

Using Yarn:

    yarn add @artevelde-uas/canvas-lms-conference-editor-group-filter-plugin

## Usage

Just import the plug-in and add it to the Canvas app:

```javascript
import canvas from '@artevelde-uas/canvas-lms-app';
import conferenceEditorGroupFilterPlugin from '@artevelde-uas/canvas-lms-conference-editor-group-filter-plugin';

canvas.addPlugin(conferenceEditorGroupFilterPlugin);

canvas.run();
```
