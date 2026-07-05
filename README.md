<div align = "center">
  <img src = "https://i.postimg.cc/W47txMqX/naissance-logo-square.png" height = "64"> <img src = "https://i.postimg.cc/0NCrhpK4/naissance-logo.png" height = "64">
</div>
<br>
<table>
  <tr>
    <td width = "50%" valign = "top">
      <img src = "https://i.postimg.cc/dq7HLyrV/naissance-01.png">
      <div align = "center">Collation/Livemap with ORBATs, events, and naval data.<br>(World/Ukraine/MidEast) 25 March 2026.</div>
    </td>
    <td valign = "top">
      <img src = "https://i.postimg.cc/Sm11Sr2Q/naissance-02.png">
      <div align = "center">Spreadsheet/keyframes for Naissance geometries.<br>(Atlas) 1 January 164BC.</div>
    </td>
  </tr>
  <tr>
    <td width = "50%" valign = "top">
      <img src = "https://i.postimg.cc/Mz336DMc/naissance-03.png">
      <div align = "center">Visual scripting between Nodes <-> Blocks <-> Code.<br>All 3 are transpiled by Naissance's IDE.</div> 
    </td>
    <td valign = "top">
      <img src = "https://i.postimg.cc/qpDDJLhK/naissance-04.png">
      <div align = "center">City populations in Austria-Hungary.<br>(Stadestér/Velkscala) 31 December 1900.</div>
    </td>
  </tr>
</table>
        
<div align = "center">

[![Join our community (Element Matrix)!](https://img.shields.io/badge/chat-on%20matrix-51bb9c?style=for-the-badge)](https://matrix.to/#/#confoederatio:matrix.confoederatio.org) [![Join our community (Discord)!](https://img.shields.io/discord/548994743925997570?label=Discord&style=for-the-badge)](https://discord.gg/89kQY2KFQz) ![](https://img.shields.io/github/languages/code-size/Confoederatio/Naissance?style=for-the-badge)

</div>
<div align = "center">
<img src = "https://i.postimg.cc/3ND2B1zL/crd-coat-of-arms-logo.png" height = "52"> <img src = "https://i.postimg.cc/ZZk34WkC/vercengen-logo.png" height = "52">
</div><br>

- E-mail: [vf@confoederatio.org](mailto:vf@confoederatio.org)
- Documentation (Naissance): [docs.confoederatio.org/Naissance](https://docs.confoederatio.org/Naissance)
  - [Mirror: confoederatiodocs.info](https://confoederatiodocs.info/CRD+(Confoederatio%2C+Research+Division)/Documentation/Software/Naissance/Naissance)
- Documentation (Vercengen): [confoederatio.org/Vercengen](https://confoederatio.org/Vercengen/)

### Abstract.

> [!NOTE]
> This repository contains **production** builds for Naissance HGIS. If you require leading capabilities, including pre-packaged Livemap/Histmap scripts, consider using [Naissance Collation](https://github.com/Confoederatio/Collation) instead.

**Naissance HGIS** is a 3D map editor for geospatial data with a focus on ease-of-use and capability. If you need to edit data dealing with time and space, Naissance is the place to do it. History is managed via keyframes (either static or interpolated based on use-case), and a ground-up Undo/Redo Tree system.

Users can create groups, layers, overlays, and utilise brushes much like in traditional raster editing programs in addition to traditional vector-based editing tools. Brushes are designed around vector-as-raster technology, and have 0m precision for operations as well as snap-to features.

An integrated office suite is also available for IDEs, spreadsheets/graphing, word processing, and browsing.

<details open>
  <summary><h3>Installation.</h3></summary>

**Note.** Most of the dev builds are built for Windows, since that's what most use. If you are on MacOS/Linux and need tech support, please join the Discord.

<ins>Stable Release (1.9.3, Windows):</ins>
1. Download [Naissance 1.9.3b](https://drive.google.com/file/d/1nC_lJdeNy6Ati9Rir94Xr0z9lRuLHVZH/view?usp=sharing)
2. Extract ZIP file when downloaded.
3. Run `naissance.exe`.

<ins>Latest Dev Build</ins> or <ins>MacOS/Linux:</ins>
1. Download Node.JS if not installed: https://nodejs.org/en/download
2. Click `Code` > `Download ZIP` > Extract ZIP file when downloaded.
3. Run `autorun.bat` if on Windows. If on MacOS/Linux, run `autorun.sh`.
    
</details>

To get the most out of Naissance's built-in visual scripting and custom UI capabilities, you may find it useful to familiarise yourself with our software engine, [Vercengen](https://github.com/Confoederatio/Vercengen). This is bundled with Naissance, and you do not have to install it separately.

---

Maps are saved as `.naissance` files, or in the case of Livemaps, as mapmodes with associated Workers. As such, they are denoted as either being:

- <ins>Livemaps</ins>, which produce Ontology streams from Blacktraffic Workers, with built-in scraping and processing APIs, and are used for **real-time data**.
- <ins>Histmaps</ins>, which are **historical to near-real time data** that do not require live processes. They typically rely on local save files and the built-in keyframe system.

### Extensibility.

Naissance HGIS is compatible with anything in the npm, Python (both regular pip and `.ipynb` notebooks), R, and LMStudio ecosystems via Vercengen. UI components are additionally just as extensible, as they need only store an `.element`: HTMLElement and `.v` (state value), and can be composed on the fly. Since it is Electron-based, it slots into native web map libraries unlike legacy GIS.

These libraries and utils can also be used in the visual script editor (alongside GDAL/GRASS/Magick/SAGA if they are installed). ASC, CSV, GeoJSON, GeoPNG, GeoTIFF, KML/KMZ, NC, OSM, SHP, and other file formats are supported by default; alongside Proj4JS live-warping (including all strings from https://epsg.io/). Projections can also be adjusted via mathematical expressions where Proj4 is not sufficient. 

Blacktraffic scrapers rely on Chrome (Puppeteer) and Firefox (Selenium) and can capture Deck.gl, Leaflet, MapLibre, Maptalks and OpenLayers geometries. 3D geometries beyond 2.5D use .gltf files and 3D Tiles (ideally via Blender), with full Three.js support. 2D operations use a custom fork of [Turf.js](https://github.com/ConfoederatioVF/Turf.performant), with Geospatiale for advanced operations.

<details>
  <summary><h3>Naissance World Model (Datasets).</h3></summary>

For ready-made data analysis, you may find it useful to use Confoederatio histmaps/livemaps instead. We typically refer to the collection of all our datasets as the **Naissance World Model**, which is divided as follows alongside corresponding metadata.

<div align = "center">
  <img src = "https://i.postimg.cc/wjLr09mJ/stadester-eoscala.png" width = "100%"><br><br>
  Left: Selected population, urban growth, and sampling data from Stadestér/Velkscala, alongside testing and validation benchmarks.<br>
  Right: Estimated GDP PPP data from Eoscala (3000BC-2020AD)
</div>

#### Histmap:

> **Note.** Stadestér refers to urban data, whereas Velkscala refers to population data generally, including ALCC/LU models.

- Atlas: (Vector) - De facto polity extents from 3000BC-2026AD, GeoJSON. Sub-yearly resolution. De jure polity extents from C-Shapes 2.0.
  - [[Dataset (.json)]](https://confoederatio.org/data/atlas_0.5b.json) | [[Dataset (.naissance)]](https://confoederatio.org/data/atlas_0.5b.naissance) | [[Timelapse]](https://www.youtube.com/watch?v=Kc0zNfiAd8c) | [[Webview]](https://confoederatio.org/pages/dataview)
- Eoscala: (Raster) - Economic estimates (GDP PPP) from 10000BC-2023AD, (Gini) from 21500BC-2025AD at 5-arcmin resolution.
  - [[Dataset]](https://github.com/Confoederatio/Eoscala-Velkscala) | [[Methodology]](https://confoederatio.org/papers/Eoscala%201.0_Velkscala%200.5_%20A%20Gridded%20Reconstruction%20of%20Global%20GDP%20and%20Population%20from%2010000BC%20to%20the%20Present-4.pdf)
- Stadestér/Velkscala: (Raster/Vector) - Population estimates (rural, urban, total), land use and ALCC (from HYDE/LUH2KK10) from 10000BC-2025AD. Urban extents and locations are given as GeoJSON datasets, with individual pop. estimates for 41k+ cities between 3000BC-2025AD. Yearly urban extents are made available from 1800AD cities. 5-arcmin resolution.
  - [[Dataset (Github)]](https://github.com/Confoederatio/Stadester) | [[Dataset (Zenodo)]](https://zenodo.org/records/17180328) | [[Methodology]](https://confoederatio.org/papers/Stadest%C3%A9r%201.0%20-%20A%20Global%20Database%20of%2041000%2B%20Cities%20From%203000BC%20to%20the%20Present.pdf)
 
<div align = "center">
  <img src = "https://i.postimg.cc/VkhQL7Cp/17-velkscala.png" width = "50%"><br><br>
  Land-use reconstructions for Velkscala vs. LUH2.
</div>

#### Livemap:

- Collation (Vector) - ORBATs, territorial control, and geospatialised news aggregation. Scripts for self-hosting are available [here](https://github.com/Confoederatio/Collation).
- Deprojector (Beta; Raster) - Arbitrary projection-to-projection georeferencing using ML. These scripts are currently a proof-of-concept and not recommended for production.
  - [[Tool (Github)]](https://github.com/Confoederatio/Deprojector) 

</details>
<details>
  <summary><h3>Supported File Formats.</h3></summary>

**Note.** Vector to raster conversions depend on GeoJSON <-> GeoPNG. Vectorisation uses kNN-binning thresholds or unique colour IDs, and rasterisation uses GeoPNGs with associated IDs. Model building for raster geoprocessing is handled via the Node Editor.

For multi-device geoprocessing using DAGs and sharded DBs, see [Collation's multithreading branch](https://github.com/ConfoederatioVF/Collation/tree/2026-multithreading).

Raster Formats:
- .asc (ASC)
- .nc (NetCDF)
- .png (GeoPNG) - Either KNN-threshold binning or ID based.
- .tif (GeoTIFF)

Scripting Formats:
- Excel/Google Sheets (via DatavisSuite/Spreadsheet)
- .ipynb (Jupyter Notebook)
- .js (JavaScript)
- .R (R)
- .py (Python)
- .ve-ne (Forse/Vercengen)

Vector Formats:
- .csv (CSV)
- .gltf (glTF)
- .gpx (GPX)
- .json (GeoJSON)
- .kml (KML)
- .kmz (KMZ)
- .naissance (Naissance)
- .osm (OSM)
- .polyline (Polyline)
- .shp/.zip (Shapefile)
- .topojson (TopoJSON)
- .wkt (WKT)
  
</details>
