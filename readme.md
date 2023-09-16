## Installation
  `$ cd react-demo`

## Setup

1. Then install the dependencies:

   `$ npm install`

1. Open the directory in your code editor.

1. Open the `react-demo/src/config/dev.ts` file, and enter required session values for the variables:

   | Key                   | Value Description |
   | -----------------------|-------------|
   | `sdkKey`     | Your Video SDK Key. Required. |
   | `sdkSecret`  | Your Video SDK Secret. Required. |
   | `topic`      | Required, a session name of your choice or the name of the session you are joining. |
   | `name`       | Required, a name for the participant. |
   | `password`   | Required, a session passcode of your choice or the passcode of the session you are joining. |

   Example:

   ```js
   {
     sdkKey: 'YOUR_VIDEO_SDK_KEY',
     sdkSecret: 'YOUR_VIDEO_SDK_SECRET',
     topic: 'Cool Cars',
     name: 'user123',
     password: 'abc123'
   }
   ```

1. Save `dev.ts`.

1. Run the app:

   `$ npm start`

## Usage

1. Navigate to http://localhost:3000.
2. Click copy link and mail your attendees. (for testing use different browsers, or use Incognito mode)