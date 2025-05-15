# Conductor

Conductor is a web application designed to empower future conductors by allowing them to control sound using an Arduino Nano 33 BLE Sense. The application leverages the BLE (Bluetooth Low Energy) capabilities of the Arduino to receive data and influence audio output.

## Features

- Control sound parameters using gestures or movements detected by the Arduino Nano 33 BLE Sense.
- Intuitive web interface for interacting with the sound control.
- Leverages Bluetooth Low Energy for wireless communication between the Arduino and the web application.

## Technologies Used

- **Frontend:** Nuxt Framework
- **Hardware:** Arduino Nano 33 BLE Sense
- **Communication:** Bluetooth Low Energy (BLE)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [PNPM](https://pnpm.io/installation)
- [Arduino IDE](https://www.arduino.cc/en/software)

### Development

**1. Clone the Repository:**

```bash
git clone https://github.com/TinyML-TH-Ohm/conductor.git
cd conductor
```

**2. Application Setup (Frontend):**

Navigate to the project's root directory in your terminal.

```bash
pnpm install
pnpm dev
```

The web application should now be running at [http://localhost:3000](http://localhost:3000).

**3. Arduino Setup:**

Navigate to the `arduino/` directory in your terminal.

```bash
cd arduino
```

Open this folder in the Arduino IDE. Ensure you have the necessary board support package installed for the Arduino Nano 33 BLE Sense. Upload the sketch to your Arduino.

### Deployment

**Application Deployment:**

The web application is configured for automatic deployment on github page whenever changes are pushed to the `main` branch of the repository.

**Arduino Deployment:**

Deploying the Arduino sketch involves uploading it to the board using the Arduino IDE.

**Important Note on Bluetooth UUIDs:**

The Bluetooth connection between the Arduino and the web application relies on matching UUIDs for the BLE service and characteristics. The following UUIDs are hardcoded in both the Arduino sketch and the web application:

```sh
SERVICE_UUID = '4798e0f2-0000-4d68-af64-8a8f5258404e'
BLE_STROKE_UUID = '4798e0f2-300a-4d68-af64-8a8f5258404e'
BLE_PREDICTION_UUID = '4798e0f2-300b-4d68-af64-8a8f5258404e'
```

If you modify these UUIDs in the Arduino sketch, you **must** also update them in the web application code for the connection to work correctly.

## Contact
