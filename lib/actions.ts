"use server"

import { auth } from "@/auth"
import { parseServerActionResponse } from "./utils";
import slugify from 'slugify';
import { writeClient } from "@/sanity/lib/write-client";


export const createPitch = async(state: any, form: FormData, pitch: string) => {
    const session = await auth(); //extract session to determine author of startup

    if (!session) return parseServerActionResponse({error: 'Not signed in', status: 'ERROR'}); //if session doesn't exist we return an error

    const {title, description, category, link} = Object.fromEntries(
        Array.from(form).filter(([key]) => key !== 'pitch'),
    ) //extract all the vakues from the form. These values are the title description, category and link entered into the form

    const slug = slugify(title as string, {lower: true, strict: true}) //create a slug from the title

    try {
        
        const startup = {
            title,
            description,
            category,
            image: link,
            slug: { 
              _type: slug,
              current: slug,
            },
            author: {
              _type: "reference",
              _ref: session?.id,
            },
            pitch,
        }; //take all extracted data from formdata and pitch, and the slug we created and pass into the startup variable

        const result = await writeClient.create({_type: 'startup', ...startup}); // create a result variable that writes all the data in the startup variable into our sanity database

        return parseServerActionResponse({...result,
            error: '',
            status: 'SUCCESS'
        }) //return created strigified result variable 

    } catch (error) {
        console.log(error);

        return parseServerActionResponse({error: JSON.stringify(error), status:"ERROR",})
        
    }
}