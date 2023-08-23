import nest_asyncio
nest_asyncio.apply()

import asyncio
from pyppeteer import launch
import json
import pandas as pd
from tabulate import tabulate

#list to store extracted data
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

async def main():
    browser = await launch()
    page = await browser.newPage()

    # Setting up request interception
    await page.setRequestInterception(True)
    page.on('request', lambda req: asyncio.ensure_future(intercept_request(req)))

    await page.goto('https://www.lenovo.com/us/en/phones/')
    await asyncio.sleep(10)  # 10 seconds to ensure all requests are captured

    await browser.close()

    # Convert extracted data to a pandas DataFrame
    df = pd.DataFrame(extracted_data)
    await browser.close()

    # Adjust display options
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_colwidth', -1)
    # Print the DataFrame in a tabular format
    print(tabulate(df, headers='keys', tablefmt='grid'))

asyncio.get_event_loop().run_until_complete(main())
start_button.on_click(on_button_click)

# Display the widgets
display(url_input, start_button, output)
