# TradingView Widget

*TradingView Widget* is an application designed for Windows users who want to keep track of their investments at a glance in a non-obtrusive way. This stock market ticker widget sits on your desktop and allows quick reference to user-selected stock widgets powered by TradingView.

## Access the Application

You can download the application from the [releases section](https://github.com/JamesDavidMorris/StockTickerWidget/releases/new) of this repository.

## Demonstration

<video width="1920" height="1080" controls>
  <source type="video/mp4" src="https://github.com/JamesDavidMorris/StockTickerWidget/blob/83b0bea09727e7d95c3976366ad513871db292f3/TradingViewWidget_Demo.mp4">
</video>

## Features

- **Customizable Tickers**: Create your own list of real-time updating tickers from any provided by TradingView.
- **Easy Ticker Management**: Change tickers easily by right-clicking on the Electron system tray widget, clicking "Change Tickers," and pasting the HTML code from TradingView.
- **Flexible Positioning and Resizing**: Position and resize the application by holding Shift and using the mouse.
- **Quick Access to Detailed Views**: Open any ticker in your default web browser for a detailed view by Ctrl+clicking.
- **Input Control**: Enable or disable mouse input.
- **Always On Top Mode**: Enable or disable the always on top mode.
- **Persistent Settings**: All settings are saved to a .ini file for persistence across sessions.

## Installation and Setup

1. Download the application from the [releases section](https://github.com/JamesDavidMorris/StockTickerWidget/releases/new).
2. Run the application, and it will automatically set to start on Windows startup.

## Usage Instructions

1. Right-click the "Change Tickers" button on the application in the system tray to open your default notepad application.
2. Visit [TradingView Tickers](https://www.tradingview.com/widget-docs/widgets/tickers/ticker/) to create your list of tickers.
   - Select a transparent background, click "Apply," and then "Copy code".
3. Paste this code into the `widget.html` file that opened in your notepad editor, then save the file.
4. Move and resize the widget on your screen to the desired size using Shift+mouse.
5. Ctrl+click your tickers to open them in your default web browser for a more detailed view.
6. Optionally, right-click the application in the system tray to disable input or enable always on top mode.

## Technologies Used

- **Electron**: A framework for building cross-platform desktop apps with JavaScript, HTML, and CSS.
- **JavaScript**: The main programming language used for the application.
- **HTML**: Utilized for the content of the widget by injecting the ticker HTML code into the application.
- **CSS**: Used for styling the widget and ensuring a seamless visual integration.

## Disclaimer

This application has no association with TradingView. It is an independent project developed for personal use and demonstration purposes.