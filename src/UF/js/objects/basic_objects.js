{
  /*
    cleanObject() - Removes both zero values and undefined/null values from an object by default.
    arg0_object: (Object) - The object to pass.
    arg1_options: (Object)
      remove_falsey: (Boolean) - Optional. Whether to remove falsey values. False by default.
      remove_zeroes: (Boolean) - Optional. Whether to remove zero values from the cleaned object. False by default.

    Returns: (Object)
  */
  function cleanObject (arg0_object, arg1_options) {
    //Convert from parameters
    var object = arg0_object;
    var options = (arg1_options) ? arg1_options : {};

    //Clean stringify object first before parsing remove_zeroes
    var cleaned_object = cleanStringify(object);

    var all_cleaned_keys = Object.keys(cleaned_object);

    //Iterate over all_cleaned_keys
    for (var i = 0; i < all_cleaned_keys.length; i++) {
      var local_value = cleaned_object[all_cleaned_keys[i]];

      if (local_value == undefined || local_value == null)
        delete cleaned_object[all_cleaned_keys[i]];
      if (options.remove_falsey) {
        if (!local_value)
          delete cleaned_object[all_cleaned_keys[i]];
      } else if (options.remove_zeroes) {
        if (local_value == 0)
          delete cleaned_object[all_cleaned_keys[i]];
      }

      //Recursively call function
      if (typeof local_value == "object")
        cleaned_object[all_cleaned_keys[i]] = cleanObject(local_value, options);
    }

    //Return statement
    return cleaned_object;
  }

  /*
    dumbFlattenObject() - Non-recursively flattens the given input object, removing only 1 layer at a time.
    arg0_object: (Object) - The input object to process.

    Returns: (Object)
  */
  function dumbFlattenObject (arg0_object) {
    //Convert from parameters
    var object = arg0_object;

    //Declare local instance variables
    var all_object_keys = Object.keys(object);
    var new_obj = {};

    //Iterate over all_object_keys and move their subobject values to new_obj
    for (var i = 0; i < all_object_keys.length; i++) {
      var local_value = object[all_object_keys[i]];

      if (!Array.isArray(local_value) && typeof local_value == "object") {
        var all_subkeys = Object.keys(local_value);

        //Iterate over all all_subkeys
        for (var x = 0; x < all_subkeys.length; x++)
          new_obj[all_subkeys[x]] = local_value[all_subkeys[x]];
      } else {
        new_obj[all_object_keys[i]] = local_value;
      }
    }

    //Return statement
    return new_obj;
  }

  /*
    dumbMergeObjects()- Merges two objects non-recursively. Overrides all values.
    arg0_object: (Object) - The object to merge into.
    arg1_object: (Object) - The object that takes precedence.
  */
  function dumbMergeObjects (arg0_object, arg1_object) {
    //Convert from parameters
    var object = arg0_object;
    var ot_object = arg1_object;

    //Declare local instance variables
    var all_ot_object_keys = Object.keys(ot_object);

    //Iterate over all_ot_object_keys
    for (var i = 0; i < all_ot_object_keys.length; i++) {
      var local_value = ot_object[all_ot_object_keys[i]];

      object[all_ot_object_keys[i]] = local_value;
    }

    //Return statement
    return object;
  }

  /*
    equateObject() - Equates two objects over an interval.
    arg0_object: (Object)
    arg1_key: (String)
    arg2_object: (Object)
    arg3_key: (String)
    arg4_interval: (Number) - Optional. 100 by default.
    arg5_options: (Object)
      cleanup_function: (Function)
  */
  function equateObject (arg0_object, arg1_key, arg2_object, arg3_key, arg4_interval, arg5_options) {
    //Convert from parameters
    var object = arg0_object;
    var key = arg1_key;
    var ot_object = arg2_object;
    var ot_key = arg3_key;
    var interval = (arg4_interval) ? arg4_interval : 100;
    var options = (arg5_options) ? arg5_options : {};

    //Return statement; set interval
    return setInterval(function(object, key, ot_object, ot_key){
      object[key] = ot_object[ot_key];

      if (options.cleanup_function)
        options.cleanup_function();
    }, interval, object, key, ot_object, ot_key, interval);
  }

  /*
    flattenObject() - Moves all keys into the 1st nesting.
    arg0_object: (Object) - The object to pass.

    Returns: (Object)
  */
  function flattenObject (arg0_object) {
    //Convert from parameters
    var object = arg0_object;

    //Declare local instance variables
    var all_object_keys = Object.keys(object);

    //Iterate over all_object_keys to move keys into current object
    for (var i = 0; i < all_object_keys.length; i++) {
      var flattened_subobj = {};
      var local_subobj = object[all_object_keys[i]];

      if (typeof local_subobj == "object") {
        flattened_subobj = flattenObject(local_subobj);

        var all_flattened_keys = Object.keys(flattened_subobj);

        for (var x = 0; x < all_flattened_keys.length; x++)
          if (!object[all_flattened_keys[x]]) {
            object[all_flattened_keys[x]] = flattened_subobj[all_flattened_keys[x]];
          } else {
            object[all_flattened_keys[x]] += flattened_subobj[all_flattened_keys[x]];
          }
      } else if (typeof local_subobj == "number") {
        if (!object[all_object_keys[i]])
          object[all_object_keys[i]] = local_subobj;
        //Do not implement an else object here because that would add 1n per depth
      } else {
        object[all_object_keys[i]] = local_subobj;
      }
    }

    //Delete any remanent typeof object in the current object
    all_object_keys = Object.keys(object);

    for (var i = 0; i < all_object_keys.length; i++)
      if (typeof object[all_object_keys[i]] == "object")
        delete object[all_object_keys[i]];

    //Return statement
    return object;
  }

  /*
    getAllObjectKeys() - Fetches all keys in an object recursively.
    arg0_object: (Object) - The object to list all keys for.
    arg1_options: (Object)
      include_parent_keys: (Boolean) - Optional. Whether to include parent keys. False by default.

    Returns: (Array<String>)
  */
  function getAllObjectKeys (arg0_object, arg1_options) {
    //Convert from parameters
    var object = arg0_object;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.current_key) options.current_key = "";

    //Declare local instance variables
    var all_object_keys = Object.keys(object);
    var object_keys_array = [];

    //Iterate over all_object_keys
    for (var i = 0; i < all_object_keys.length; i++) {
      var local_value = object[all_object_keys[i]];

      if (typeof local_value != "object" || options.include_parent_keys)
        object_keys_array.push(`${options.current_key}${all_object_keys[i]}`);
      if (typeof local_value == "object" && !Array.isArray(local_value)) {
        var new_options = JSON.parse(JSON.stringify(options));
        new_options.current_key += `${all_object_keys[i]}.`;

        var new_object_keys = getAllObjectKeys(local_value, new_options);
        object_keys_array = object_keys_array.concat(new_object_keys);
      }
    }

    //Return statement
    return object_keys_array;
  }

  /*
    getDepth() - Returns object depth as a number.
    arg0_object: (Object) - The object to fetch depth for.
    arg1_depth: (Number) - Optimisation parameter used as an internal helper.

    Returns: (Number)
  */
  function getDepth (arg0_object, arg1_depth) {
    //Convert from parameters
    var object = arg0_object;
    var depth = (arg1_depth) ? arg1_depth : 1;

    //Iterate over object
    for (var key in object) {
      if (!object.hasOwnProperty(key)) continue;

      if (typeof object[key] == "object") {
        var level = getDepth(object[key]) + 1;
        depth = Math.max(depth, level);
      }
    }

    //Return statement
    return depth;
  }

  /*
    getObjectKey() - Fetches object value from a string (e.g. 'test.one.two')
    arg0_object: (Object) - The object to fetch the key from.
    arg1_key: (String) - The string of the key to fetch from the object 'test.one.two'.

    Returns: (Variable)
  */
  function getObjectKey (arg0_object, arg1_key) {
    //Convert from parameters
    var object = arg0_object;
    var key = arg1_key;

    //Declare local instance variables
    var split_key = (Array.isArray(key)) ? key : key.split(".");
    var return_value;

    if (split_key.length <= 1 && object[split_key[0]] != undefined) {
      return_value = object[split_key[0]];
    } else {
      if (object[split_key[0]] != undefined) {
        //Preserve old index; pop from front before calling recursion
        var old_index = JSON.parse(JSON.stringify(split_key[0]));
        split_key.shift();
        var found_return_value = getObjectKey(object[old_index], split_key);

        //If value was found, return that
        if (found_return_value != undefined)
          return_value = found_return_value;
      }
    }

    //Return statement
    return return_value;
  }

  /*
    getObjectList() - Returns object as an array list.
    arg0_object_list: (Object) - The objectified list to pass.

    Returns: (Array)
  */
  function getObjectList (arg0_object_list) {
    //Convert from parameters
    var list_obj = arg0_object_list;

    //Declare local instance variables
    if (list_obj) {
      var all_list_keys = Object.keys(list_obj);
      var object_array = [];

      //Append everything in object as object_array
      for (var i = 0; i < all_list_keys.length; i++)
        object_array.push(list_obj[all_list_keys[i]]);

      //Return statement
      return object_array;
    } else {
      return [];
    }
  }

  /*
    getSubobject() - Fetches a subobject.
    arg0_object: (Object) - The object to pass.
    arg1_key: (String) - The key to recursively look for to fetch the local subobject.
    arg2_restrict_search: (Boolean) - Whether to restrict the search to the 1st layer.

    Returns: (Object)
  */
  function getSubobject (arg0_object, arg1_key, arg2_restrict_search) {
    //Convert from parameters
    var object = arg0_object;
    var key = arg1_key;
    var restrict_search = arg2_restrict_search;

    //Declare local instance variables
    var all_object_keys = Object.keys(object);

    //Process key
    if (!Array.isArray(key))
      key = getList(key.split("."));

    //Iterate over all_object_keys
    for (var i = 0; i < all_object_keys.length; i++) {
      var local_subobj = object[all_object_keys[i]];

      if (all_object_keys[i] == key[key.length - 1]) {
        //Guard clause
        return local_subobj;
        break;
      } else if (typeof local_subobj == "object") {
        var explore_object = false;
        var new_key = JSON.parse(JSON.stringify(key));
        if (key.length > 1)
          restrict_search = true;

        if (restrict_search && all_object_keys[i] == key[0]) {
          new_key.splice(0, 1);
          explore_object = true;
        }
        if (!restrict_search) explore_object = true;

        //Restrict search for certain arguments
        if (explore_object) {
          var has_subobj = getSubobject(local_subobj, new_key, restrict_search);

          if (has_subobj) {
            //Return statement
            return has_subobj;
            break;
          }
        }
      }
    }
  }

  /*
    getSubobjectKeys() - Fetches the keys in a subobject that match the given criteria.
    arg0_object: (Object) - The object to pass to the function.
    arg1_options: (Object)
      exclude_keys: (Array<String, ...>), - A list of keys to exclude
      include_objects: (Boolean), - Optional. Whether or not to include object keys. False by default.
      only_objects: (Boolean) - Optional. Whether to only include objects. False by default.

    Returns: (Array<String, ...>)
  */
  function getSubobjectKeys (arg0_object, arg1_options) {
    //Convert from parameters
    var object = arg0_object;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.exclude_keys) options.exclude_keys = [];

    //Declare local instance variables
    var all_keys = [];
    var all_object_keys = Object.keys(object);

    //Iterate over all_object_keys
    for (var i = 0; i < all_object_keys.length; i++) {
      var local_subobj = object[all_object_keys[i]];

      if (typeof local_subobj == "object") {
        //Push key itself first
        if (!options.exclude_keys.includes(all_object_keys[i]))
          all_keys.push(all_object_keys[i]);

        var all_subkeys = getSubobjectKeys(local_subobj, options);

        if (options.include_objects || options.only_objects)
          if (!options.exclude_keys.includes(all_object_keys[i]))
            all_keys.push(all_object_keys[i]);

        for (var x = 0; x < all_subkeys.length; x++)
          if (!options.exclude_keys.includes(all_subkeys[x]))
            all_keys.push(all_subkeys[x]);
      } else {
        if (!options.only_objects)
          if (!options.exclude_keys.includes(all_object_keys[i]))
            all_keys.push(all_object_keys[i]);
      }
    }

    //Return statement
    return all_keys;
  }

  /*
    mergeObjects() - Merges two objects together.
    arg0_object: (Object) - The 1st object to merge into.
    arg1_object: (Object) - The 2nd object to concatenate/add.
    arg2_options: (Object)
      must_have_difference: (Boolean) - Optional. Whether values must be different before they can be added/subtracted from one another. False by default
      overwrite: (Boolean) - Optional. Whether to overwrite objects when merging. False by default
      recursive: (Boolean) - Optional. Whether merging is recursive. True by default

    Returns: (Object)
  */
  function mergeObjects (arg0_object, arg1_object, arg2_options) {
    //Convert from parameters - merge_obj overwrites onto merged_obj
    var merged_obj = JSON.parse(JSON.stringify(arg0_object));
    var merge_obj = JSON.parse(JSON.stringify(arg1_object));
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (options.recursive == undefined) options.recursive = true;

    //Declare local instance variables
    var all_merge_keys = Object.keys(merge_obj);

    //Iterate over all_merge_keys
    for (var i = 0; i < all_merge_keys.length; i++) {
      var current_value = merged_obj[all_merge_keys[i]];
      var local_value = merge_obj[all_merge_keys[i]];

      if (typeof local_value == "number") {
        if (merged_obj[all_merge_keys[i]]) {
          //Check if variable should be overwritten
          var to_overwrite = (options.overwrite || (options.must_have_difference && current_value == local_value));

          merged_obj[all_merge_keys[i]] = (!to_overwrite) ?
            merged_obj[all_merge_keys[i]] + local_value :
            local_value; //Add numbers together
        } else {
          merged_obj[all_merge_keys[i]] = local_value;
        }
      } else if (typeof local_value == "object" && current_value && local_value) {
        if (options.recursive)
          merged_obj[all_merge_keys[i]] = mergeObjects(current_value, local_value, options); //Recursively merge objects if possible
      } else {
        merged_obj[all_merge_keys[i]] = local_value;
      }
    }

    //Return statement
    return merged_obj;
  }

  /*
    replaceKeys() - Replaces keys in an object with alternative keys. Used for casting between object types.
    arg0_object: (Object) - The original object to change.
    arg1_options: (Object)
      <original_key>: <replacement_key> - Optional. The key to change.
  */
  function replaceKeys (arg0_object, arg1_options) {
    //Convert from parameters
    var object = (arg0_object) ? arg0_object : {};
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_object_keys = Object.keys(object);

    //Iterate over all_option_keys
    for (var i = 0; i < all_object_keys.length; i++)
      //Replace key if parallel found in options
      if (options[all_object_keys[i]]) {
        var replacement_key = options[all_object_keys[i]];

        object[replacement_key] = object[all_object_keys[i]];
        delete object[all_object_keys[i]];
      }

    //Return statement
    return object;
  }

  /*
    removeZeroes() - Removes zero values from an object.
    arg0_object: (Object) - The object to pass to the function.

    Returns: (Object)
  */
  function removeZeroes (arg0_object) {
    //Convert from parameters
    var object = JSON.parse(JSON.stringify(arg0_object));

    //Declare local instance variables
    var all_object_keys = Object.keys(object);

    //Iterate over all_object_keys
    for (var i = 0; i < all_object_keys.length; i++) {
      var local_subobj = object[all_object_keys[i]];

      if (typeof local_subobj == "number")
        if (local_subobj == 0)
          delete object[all_object_keys[i]];
      if (typeof local_subobj == "object")
        object[all_object_keys[i]] = removeZeroes(local_subobj);
    }

    //Return statement
    return object;
  }

  function setObjectKey (arg0_object, arg1_key, arg2_value) {
    //Convert from parameters
    var object = arg0_object;
    var key = arg1_key;
    var value = arg2_value;

    //Declare local instance variables
    var current = object;
    var split_key = key.split(".");

    //Iterate over split_key and set each key if not defined
    for (var i = 0; i < split_key.length; i++) {
      var local_key = split_key[i];

      //If it's the last key, set the value
      if (i == split_key.length - 1) {
        current[local_key] = value;
      } else {
        if (!current[local_key] || typeof current[local_key] != "object")
          current[local_key] = {};
        //Move top the next level
        current = current[local_key];
      }
    }

    //Return statement
    return object;
  }

  /**
   * sortKeysByObject() - Sorts the keys of an object by the order of another object.
   * @param {*} arg0_object - The object to sort.
   * @param {*} [arg1_options] - The object to sort by.
   *  @param {String} [arg1_options.key="order"] - The key to sort by. .order by default.
   * 
   * @returns {Object}
   */
  function sortKeysByObject (arg0_object, arg1_options) {
    //Convert from parameters
    var object = arg0_object;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.key) options.key = "order";
    
    var all_object_keys = Object.keys(object);
    var sorted_keys = all_object_keys.map(function (key) {
      return {
        key: key,
        order: returnSafeNumber(object[key][options.key])
      }
    });
      sorted_keys.sort(function (a, b) {
        return a.order - b.order;
      });
      all_object_keys = sorted_keys.map(function (key) {
        return key.key;
      });

    //Return statement
    return all_object_keys;
  }

  /*
    sortObject() - Sorts an object.
    arg0_object: (Object) - The object to sort.
    arg1_options: (Object)
      type: (String) - Optional. The order to sort the object in. 'ascending'/'descending'. 'descending' by default.
  */
  function sortObject (arg0_object, arg1_options) {
    //Convert from parameters
    var object = arg0_object;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var mode = (options.type) ? options.type : "descending";

    //Return statement
    return Object.fromEntries(
      Object.entries(object).sort(([, a], [, b]) => {
        //Standardise array values
        if (Array.isArray(a))
          a = getSum(a);
        if (Array.isArray(b))
          b = getSum(b);

        return (mode == "descending") ? b - a : a - b;
      })
    );
  }

  /*
    sortObjectByKey() - Sorts an object by an immediate key.
    arg0_object: (Object) - The object to sort.
    arg1_options: (Object)
      key: (String) - The sub-key to sort by. Non-recursive.
      type: (String) - Optional. The order to sort the object in. 'ascending'/'descending'. 'descending' by default.
  */
  function sortObjectByKey (arg0_object, arg1_options) {
    //Convert from parameters
    var object = arg0_object;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.mode) options.mode = "descending";

    //Declare local instance variables
    var object_keys = Object.keys(object);
    var object_array = objectToArray(object);
    var return_obj = {};

    //Iterate over object_array; assign .RESERVED_KEY to keep track of sorting
    for (var i = 0; i < object_array.length; i++)
      object_array[i].RESERVED_KEY = object_keys[i];

    //Sort by key
    object_array.sort(function(a, b) {
      return (options.mode == "descending") ? b[options.key] - a[options.key] : a[options.key] - b[options.key];
    });

    //Format return_obj
    for (var i = 0; i < object_array.length; i++) {
      return_obj[object_array[i].RESERVED_KEY] = object_array[i];
      delete return_obj[object_array[i].RESERVED_KEY].RESERVED_KEY;
    }

    //Return statement
    return return_obj;
  }
}
