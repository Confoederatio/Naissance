//Initialise functions
{ //[WIP] - Add functions to test if LMStudio is launched, and if not, to launch it automatically
	if (!global.Blacktraffic) global.Blacktraffic = {};
	
	/**
	 * The LM Studio URL to use as the default gateway.
	 * @type {string}
	 */
	Blacktraffic.lm__studio_url = "http://localhost:1234/v1/chat/completions";
	
	/**
	 * Prompts LMStudio's current model and waits for a response.
	 * 
	 * @param {string} arg0_prompt
	 * @param {Object} [arg1_options] - Any options used by LMStudio models to fine-tune parameters.
	 *  @param {number} [arg1_options.temperature=0.7]
	 *  @param {string} [arg1_options.url=Blacktraffic.lm_studio_url]
	 * 
	 * @returns {Promise<string|undefined>}
	 */
	Blacktraffic.LMStudio_prompt = async function (arg0_prompt, arg1_options) {
		//Convert from parameters
		let prompt = arg0_prompt;
		let options = (arg1_options) ? arg1_options : {};
		
		//Internal guard clause if no prompt is available
		if (prompt === undefined) return;
		
		//Initialise options
		options.temperature = Math.returnSafeNumber(options.temperature, 0.7);
		options.url = (options.url) ? options.url : Blacktraffic.lm__studio_url;
		
		//Declare local instance variables
		let data = {
			model: "local-model",
			messages: [{
				role: "user",
				content: prompt,
			}],
			...options
		};
		
		//Prompt LM Studio
		try {
			let response = await fetch(options.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) console.error(`HTTP error, status: ${response.status}`);
			
			//Wait for response
			let result = await response.json();
			
			//Return statement
			return result.choices[0].message.content;
		} catch (error) {
			console.error("Could not connect to LM Studio. Are you sure the local server is running?", error.message);
		}
	};
	
	/**
	 * Prompts LMStudio's current model with an image and associated text and waits for a response.
	 * 
	 * @param {string} arg0_prompt
	 * @param {string} arg1_image_path
	 * @param [arg2_options]
	 *  @param {string} [arg2_options.url=Blacktraffic.lm_studio_url]
	 *  
	 * @returns {Promise<string|undefined>}
	 */
	Blacktraffic.LMStudio_promptImage = async function (arg0_prompt, arg1_image_path, arg2_options) {
		//Convert from parameters
		let prompt = arg0_prompt;
		let image_path = arg1_image_path;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		options.max_tokens = Math.returnSafeNumber(options.max_tokens, 32168);
		options.url = (options.url) ? options.url : Blacktraffic.lm__studio_url;
		
		//Declare local instance variables
		let base64_image = File.convertImageToBase64(image_path);
		let extension = path.extname(image_path).replace(".", "");
		
		//1. Build the payload matching the Vision API format
		let payload = {
			model: "vision-model", // LM Studio uses whichever vision model is loaded
			messages: [{
				role: "user",
				content: [
					{ type: "text", text: prompt },
					{
						type: "image_url",
						image_url: {
							url: `data:image/${extension};base64,${base64_image}`,
						},
					},
				],
			}],
			max_tokens: options.max_tokens,
		};
		
		//2. Send prompt and wait for response
		try {
			let response = await fetch(options.url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			
			if (!response.ok) {
				let error_text = await response.text();
				
				console.error(`HTTP ${response.status}: ${error_text}`);
				return;
			}
			
			//Return statement
			let data = await response.json();
			
			return data.choices[0].message.content;
		} catch (error) {
			console.error("Error analyzing image:", error.message);
			throw error;
		}
	};
}
