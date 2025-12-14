//Initialise functions
{
	ve.initialiseThemes = function () {
		ve.registry.themes["ve-searchbar"] = {
			alignItems: "center",
			backgroundColor: `var(--bg-secondary-colour)`,
			border: `1px solid var(--bg-primary-colour)`,
			borderRadius: "3px",
			display: "flex",
			overflow: "hidden",
			marginBottom: "calc(var(--cell-padding)*1.25)",
			padding: "0 0.5rem 0 0",
			width: "20rem"
		};
	};
}