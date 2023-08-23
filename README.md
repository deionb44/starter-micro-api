import nest_asyncio
nest_asyncio.apply()

import asyncio
from pyppeteer import launch
import json
import pandas as pd
from IPython.display import display
import ipywidgets as widgets

# A global list to store extracted data
extracted_data = []

async def intercept_request(req):
    if "interact?" in req.url:
        post_data = req.postData
        try:
            data = json.loads(post_data)
            custom_dimensions = data.get("events", [{}])[0].get("xdm", {}).get("_experience", {}).get("analytics", {}).get("customDimensions", {})

            # Extract eVars
            evars = custom_dimensions.get("eVars", {})
            for key, value in evars.items():
                extracted_data.append({"tag": key, "value": str(value)})

            # Extract props
            props = custom_dimensions.get("props", {})
            for key, value in props.items():
                extracted_data.append({"tag": key, "value": str(value)})

        except json.JSONDecodeError:
            pass

    await req.continue_()

async def main(url):
    browser = await launch()
    page = await browser.newPage()

    # Setting up request interception
    await page.setRequestInterception(True)
    page.on('request', lambda req: asyncio.ensure_future(intercept_request(req)))

    await page.goto(url)
    await asyncio.sleep(10)  # wait for 10 seconds to ensure all requests are captured

    await browser.close()

    # Convert the extracted data to a pandas DataFrame
    df = pd.DataFrame(extracted_data)
    await browser.close()

    # Display the DataFrame
    display(df)

# Create widgets
url_input = widgets.Text(value='https://www.lenovo.com/us/en/accessories-and-software/', placeholder='Enter URL', description='URL:', disabled=False)
start_button = widgets.Button(description="Start Extraction")
output = widgets.Output()

def on_button_click(b):
    with output:
        asyncio.get_event_loop().run_until_complete(main(url_input.value))

start_button.on_click(on_button_click)

# Display the widgets
display(url_input, start_button, output)
