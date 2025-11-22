# Naissance HGIS

<table>
  <tr>
    <td width = "50%">
      <img src = "https://i.postimg.cc/QdxPdCDc/naissance-01-preview.png">
    </td>
    <td>
      <img src = "https://i.postimg.cc/s34GFX1Y/constele-red-04-preview.png">
    </td>
  </tr>
  <tr>
    <td width = "50%">
      <img src = "https://i.postimg.cc/q7gvypsd/constele-red-03-preview.png">
    </td>
    <td>
      <img src = "https://i.postimg.cc/63NfTbZV/naissance-02-preview.png">
    </td>
  </tr>
</table>

<img src = "https://i.postimg.cc/8CKkNXk2/crd-light-logo.png" height = "64"> &nbsp; <img src = "https://i.postimg.cc/rm9dpTq1/vercengen-logo.png" height = "64">

[![Join our community!](https://img.shields.io/discord/548994743925997570?label=Discord&style=for-the-badge)](https://discord.gg/89kQY2KFQz) ![](https://img.shields.io/github/languages/code-size/Australis-0/Naissance?style=for-the-badge) ![](https://img.shields.io/github/downloads/Australis-0/Naissance/total?style=for-the-badge)

- E-mail: [vf@confoederatio.org](mailto:vf@confoederatio.org)

### Abstract.

**Naissance HGIS** is a 3D map editor for geospatial data over the long run with a focus on ease-of-use and capability. History is managed via keyframes, and a ground up Undo/Redo Tree system allows for branching timelines and commits. Users can create groups, layers, overlays, and utilise brushes much like in traditional raster editing programs in addition to traditional vector-based editing tools.

This project is still in **beta**, and may need to be combined with our other projects (such as [Constele Red](https://github.com/Confoederatio/Constele-Red)) for intensive geoprocessing/scripting tasks, such as those requiring distributed compute. In its current state, Naissance HGIS is mainly intended for historical geometry data, whilst Constele Red is intended for heavy-duty data processing.

We intend on their eventual integration into Naissance HGIS over time.

<details>
  <summary><h3>TODO.</h3></summary>

Note that stages may not necessarily be worked on a linear order.

**S1. (Polish)**
- [x] Implement lookback for selected feature nesting
- [x] Guarantee Hierarchy consistency
- Add manual commit mode for ve.UndoRedo
- [x] Guarantee deterministic render order
- Guarantee symbol feature parity for naissance.Polygon, naissance.Line, naissance.Point (Geometry inspector)
- Finish Geometry inspector for labels, zoom behaviours, and better property data editors
- Modularise delete button at the naissance.Feature, naissance.Geometry layer
- Modularise Geometry inspector and split it into its corresponding subtypes
- naissance.Feature should only be selectable if .entities is defined
- Implement documentation and user-facing wiki in-app
- Integrate .onrename event into .onchange for window
- Add rename naissance.Geometry feature from window
- Keyframe UI and localisation

<br>

- naissance.Feature should only be selectable if .entities is defined

**S2. (Capability, Backend)**
- Group Masks (from old Naissance), applies to both naissance.Group/naissance.Layers
  - Active masks should display in a scrollable folder under the brush window
- [x] Fluid Node editor tied to Brush:
  - [x] If node editing is true, geometries come directly from DrawTool when created
  - [x] If node editing is true, selected geometry has node editing automatically turned on
  - [x] If node editing is false, re-enable brush editing (finish DrawTool if active, re-enable painting for selected geometries)
- Upgrade Vercengen to 1.0:
  - ve.CodeMirror
    - Multitab option
    - Optional file explorer for save/loading
  - ve.Graph with ggplot parity
  - ve.Hierarchy
    - Add optional filter/searchbar to ve.Hierarchy using .name, even those that are nested under minimised groups/layers
    - Custom filters via an include function
    - .oncollapse event should be moved to .onchange object
  - ve.MultiTag
    - Delimit tags with enter keys and selection logic via autocomplete/suggestions. New keys show up in green, old ones in grey, with round brackets for the total number of objects per key
  - ve.Number (should take in array type)
  - ve.Scriptly
    - Migrate out of React towards Vercengen, modernise codebase
    - Migrate to Monaco code editor (instead of CodeMirror)
    - Integrate node-based workflow and distributed compute processor similar to Constele Red, utilising GoJS instead of Baklava. Node editors would beused to determine the load order of individual files/tasks in a Script.
  - ve.Table for editing dataframes
  - ve.Text (should take in array type)
  - ve.UndoRedo/DALS should allow for manual suspension of logging actions
    - Import Timeline from File
    - Manual commits option
   
**S3. (Capability, Frontend)**
- Add ImageOverlay Feature with dynamic mesh distortion
- Default mapmodes for viewing keyframes, both on by default (Default, Default [Keyframes])
- Load last saved date for save files, load files
- Import CSV with column/row/rortate selector
- Import GeoJSON as group at selected date (auto-minimises group upon finishing)
  - Import GeoJSON with parsing (opens script editor)
- Merge Geometry
- Settings for keybinds, base layer options
- Snap to cusp nodes (layer simplification):
  - Random hole assignment based on random neighbour, holes that are smaller than the smallest polygon in the layer are filled automatically
- Difference Geometry, Intersect Geometry, Union Geometry, XOR Geometry buttons

<br>

- Custom mapmodes with schema and ve.Scriptly editor with multiple toggleable mapmodes
- General-purpose Script editor (code/block/node-based transpilation) via ve.Scriptly
- Group actions for optimisation
- Fill tool for Brush used to set the coordinates of geometries
  - Provinces mask that can be used as pre-made shapes for Fill Tool
- Livemap scripting
- Preview Mode for map
  - Custom UIs/Entities via Vercengen Editor and Scriptly for running ABMs or simulations
- Remove Enclaves button for Geometry inspector

<br>

- Data portal support
- Eoscala/Velkscala/Sehistoir/Stadestér/Atlas default databases
  
</details>

Naissance HGIS uses [Vercengen](https://confoederatio.org/Vercengen), in which UI is a subset of state.
