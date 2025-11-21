config.scripts.aoc3 = {
  split_map_image_into_tiles: {
    name: "Split Map Image Into Tiles",
    description: "Splits a map image into multiple tiles for AOC3.",
    tags: ["aoc3", "modding", "image", "image manipulation"],

    interface: {
      image_file: {
        id: "image_file",
        name: "Image File to split into multiple tiles",
        type: "file"
      },
      size_x: {
        id: "x_size",
        name: "X Size (px)",
        type: "number",

        attributes: {
          min: 0
        },
        placeholder: 2220
      },
      size_y: {
        id: "y_size",
        name: "Y Size (px)",
        type: "number",

        attributes: {
          max: 0
        },
        placeholder: 2150
      },

      confirm_button: {
        id: "confirm_button",
        name: "Confirm",
        type: "button",

        effect: {
          run_batch: `magick {image_file} -crop 2220x2150 -set filename:tile "%[fx:page.y/{size_y}]_%[fx:page.x/{size_x}]" +repage +adjoin "%[filename:tile].png"`
        }
      }
    }
  }
};
