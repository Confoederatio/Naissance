//Date UI functions
{
  function autoFillDate () {
    populateDateFields(getUISelector("date_container"), main.date);
  }

  function populateDateFields (arg0_date_container_el, arg1_date) {
    //Convert from parameters
    var date_container_el = arg0_date_container_el;
    var date = arg1_date;

    //Declare local instance variables
    var day_el = date_container_el.querySelector(`#day-input`);
    var hour_el = date_container_el.querySelector(`#hour-input`);
    var minute_el = date_container_el.querySelector(`#minute-input`);
    var month_el = date_container_el.querySelector(`#month-input`);
    var year_el = date_container_el.querySelector(`#year-input`);
    var year_type_el = date_container_el.querySelector(`#year-type`);

    var date = (arg1_date) ? arg1_date : main.date; //Feed in a custom date to populate with
    var days_in_month = JSON.parse(JSON.stringify(global.days_in_months[date.month - 1]));
    var is_leap_year = isLeapYear(date.year);
    var lowercase_months = config.defines.common.months_lowercase;
    var months_html = [];

    //Leap year check
    if (is_leap_year && date.month == 2)
      days_in_month++;

    //Adjust days if year_el; month_el are changed. Add leading zeroes to hour_el; minute_el if changed
    year_el.onchange = function () {
      var local_day = parseInt(deordinalise(day_el.value));
      var local_month = parseInt(month_el.value);
      var local_year = parseInt(this.value);

      //Max Leap year check
      if (isLeapYear(local_year) && parseInt(month_el.value) == 2)
        if (local_day > 29)
          day_el.value = ordinalise(29);
      //Max Month check
      if (local_day > days_in_month)
        day_el.value = ordinalise(days_in_month);
      if (local_day < 1)
        day_el.value = ordinalise(1);
    };
    month_el.onchange = function () {
      var local_day = parseInt(deordinalise(day_el.value));
      var local_month = getMonth(this.value);
      var local_year = parseInt(year_el.value);

      //Max Leap year check
      days_in_month = JSON.parse(JSON.stringify(days_in_months[local_month - 1]));
      if (isLeapYear(local_year) && local_month == 2) days_in_month++;

      //Set month; day .value
      month_el.value = config.defines.common.months_uppercase[local_month - 1];
      day_el.value = (local_day <= days_in_month) ? ordinalise(local_day) : ordinalise(days_in_month);
    };
    day_el.onchange = function () {
      var local_day = parseInt(deordinalise(this.value));
      var local_month = parseInt(month_el.value);
      var new_local_day = local_day;

      //Make sure local_day is a valid number
      if (isNaN(local_day) || local_day < 1)
        new_local_day = ordinalise(1);

      //Make sure local_day fits within bounds
      if (local_day > days_in_month)
        new_local_day = ordinalise(days_in_month);
      day_el.value = new_local_day;

      //Standardise day_el.value to ordinal
      if (!isNaN(day_el.value) && !isNaN(parseFloat(day_el.value)))
        day_el.value = ordinalise(day_el.value);
    };

    //Force leading zeroes for hours and minutes, make sure inputs are valid
    hour_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 23), 0);
      if (this.value < 10)
        this.value = `0${parseInt(this.value)}`;
    };
    minute_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 59), 0);
      if (this.value < 10)
        this.value = `0${parseInt(this.value)}`;
    };

    //Set values according to current date
    day_el.value = ordinalise(date.day);
    hour_el.value = `${(date.hour < 10) ? "0" : ""}${date.hour}`;
    minute_el.value = `${(date.minute < 10) ? "0" : ""}${date.minute}`;
    month_el.value = months[date.month - 1];
    year_el.value = Math.abs(date.year); //[WIP] - BC handling
    year_type_el.value = (date.year >= 0) ? "AD" : "BC";
  }
}

//[WIP] - DEPRECATE - Date UI functions
{
  function printDate (arg0_date) {
    //Convert from parameters
    var date = arg0_date;

    //Return statement
    return `${date.year}.${(date.month < 10) ? "0" : ""}${date.month}.${(date.day < 10) ? "0" : ""}${date.day} ${(date.hour < 10) ? "0" : ""}${date.hour}:${(date.minute < 10) ? "0" : ""}${date.minute}`;
  }

  function printDateError (arg0_string) {
    //Convert from parameters
    var error_string = arg0_string;

    //Print error
    date_error_field.innerHTML += `[WARN] &nbsp; ${error_string}`;

    setTimeout(function(){
      date_error_field.innerHTML = date_error_field.innerHTML.replace(`[WARN] &nbsp; ${error_string}`, "");
    }, 10000);
  }

  function readDate () {
    //Declare local instance variables
    var day_field = getUISelector(`day_el`);
    var month_field = getUISelector(`month_el`);
    var year_field = getUISelector(`year_el`);
    var year_type_field = getUISelector(`year_type_el`);

    var hour_field = getUISelector(`hour_el`);
    var minute_field = getUISelector(`minute_el`);
    var new_date = JSON.parse(JSON.stringify(main.date));

    //Check if year is valid
    if (!isNaN(year_field.value)) {
      if (year_field.value > 0) {
        new_date.year = (year_type_field.value == "AD") ?
          parseInt(year_field.value) :
          parseInt(year_field.value)*-1;
      } else if (year_field.value == 0) {
        new_date.year = (year_type_field.value == "AD") ?
          1 : -1;
      } else {
        new_date.year = year_field.value;
        year_type_field.value = (year_type_field.value == "AD") ? "BC" : "AD";
      }
    } else {
      autoFillDate();
    }

    //Check if month is valid
    if (!isNaN(month_field.value)) {
      var new_month = parseInt(month_field.value);

      if (new_month)
        new_date.month = new_month;
      else
        printDateError(`There is no ${ordinalise(month_field.value)} month of the year!`);
    } else {
      var new_month = -1;

      for (var i = 0; i < lowercase_months.length; i++)
        if (lowercase_months[i].includes(month_field.value.toLowerCase()))
          new_month = i + 1;

      if (new_month != -1) {
        new_date.month = new_month;
      } else
        printDateError(`You must input a valid month!`);
    }

    //Check if day is valid
    var day_input = deordinalise(day_field.value);

    if (!isNaN(day_input)) {
      //Check if date exists
      if (day_input > 0 && day_input <= days_in_months[new_date.month - 1]) {
        new_date.day = day_input;
      } else {
        if (new_date.month == 2 && (isLeapYear(new_date.year) && day_input == 29))
          new_date.day = 29;
        else
          printDateError(`${months[new_date.month - 1]} doesn't have this day!`);
      }
    } else
      printDateError(`You must input a valid day!`);

    //Check if hour is valid
    if (hour_field.value >= 0 && hour_field.value < 24)
      new_date.hour = hour_field.value
    else
      printDateError(`There are only 24 hours in a day!`);

    //Check if minute is valid
    if (minute_field.value >= 0 && minute_field.value < 60)
      new_date.minute = minute_field.value
    else
      printDateError(`There are only 60 minutes in an hour!`);

    //Numericise all dates
    var all_fields = Object.keys(new_date);

    for (var i = 0; i < all_fields.length; i++)
      new_date[all_fields[i]] = parseInt(new_date[all_fields[i]]);

    //Set date
    setDate(new_date);
    autoFillDate();
  }
}

//Initialise Date UI functions
{
  function initDate () {
    //Declare local instance variables
    var date_fields = getUISelector("date_fields", true);

    //Populate UI
    autoFillDate();

    //Keypress functions
    for (var i = 0; i < date_fields.length; i++)
      date_fields[i].addEventListener("keyup", function (e) {
        if (e.key == "Enter") readDate();
      });
  }

  function initDateUI () {
    //Declare local instance variables
    var bottom_left_date_ui = createContextMenu({
      anchor: `#date-container`,
      class: `date-ui unique`,
      id: "date-ui",
      name: `Date:`,

      date_input: {
        id: "date-input",
        name: "Date:",
        type: "date",
        multiple_rows: true,

        x: 0,
        y: 0
      }
    });

    //Initialise date only after Date UI has first been loaded
    initDate();
  }
}
