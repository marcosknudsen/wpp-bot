import axios from "axios";

export async function isOn(n) {
  try {
    let response = await axios.get(
      `https://192.168.0.252/api/${process.env.HUE_CLIENT}/lights/${n}`
    );
    response = response.data;
    response = response.state;
    response = response.on;
    return response;
  } catch (err) {
    return "ERROR";
  }
}

export async function turnOn(n) {
  try {
    if (!(await isOn(n))) {
      axios.put(
        `https://192.168.0.252/api/${process.env.HUE_CLIENT}/lights/${n}/state`,
        {
          on: true,
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}

export async function turnOff(n) {
  try {
    if (await isOn(n)) {
      axios.put(
        `https://192.168.0.252/api/${process.env.HUE_CLIENT}/lights/${n}/state`,
        {
          on: false,
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}
