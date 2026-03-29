# Naissance HGIS

<table>
  <tr>
    <td width = "50%">
      <img src = "https://i.postimg.cc/dq7HLyrV/naissance-01.png">
    </td>
    <td>
      <img src = "https://i.postimg.cc/Sm11Sr2Q/naissance-02.png">
    </td>
  </tr>
  <tr>
    <td width = "50%">
      <img src = "https://i.postimg.cc/Mz336DMc/naissance-03.png">
    </td>
    <td>
      <img src = "https://i.postimg.cc/qpDDJLhK/naissance-04.png">
    </td>
  </tr>
</table>

<img src = "https://i.postimg.cc/3ND2B1zL/crd-coat-of-arms-logo.png" height = "48"> <img src = "https://i.postimg.cc/ZZk34WkC/vercengen-logo.png" height = "48">

[![Join our community!](https://img.shields.io/discord/548994743925997570?label=Discord&style=for-the-badge)](https://discord.gg/89kQY2KFQz) ![](https://img.shields.io/github/languages/code-size/Australis-0/Naissance?style=for-the-badge)

- E-mail: [vf@confoederatio.org](mailto:vf@confoederatio.org)

### Abstract.

> [!NOTE]
> This repository contains **production** builds for Naissance HGIS. If you require leading capabilities, including pre-packaged Livemap/Histmap scripts, consider using [Naissance SVEA](https://github.com/Confoederatio/SVEA) instead.

**Naissance HGIS** is a 3D map editor for geospatial data with a focus on ease-of-use and capability. History is managed via keyframes, and a ground-up Undo/Redo Tree system allows for branching timelines and commits. Users can create groups, layers, overlays, and utilise brushes much like in traditional raster editing programs in addition to traditional vector-based editing tools.

To get the most out of Naissance's built-in visual scripting and custom UI capabilities, you may find it useful to familiarise yourself with our software engine, [Vercengen](https://confoederatio.org/Vercengen/).

---

Maps are saved as `.naissance` files, or in the case of Livemaps, as mapmodes with associated Workers. As such, they are denoted as either being:

- <ins>Livemaps</ins>, which produce Ontology streams from Blacktraffic Workers, with built-in scraping and processing APIs, and are used for **real-time data**.
- <ins>Histmaps</ins>, which are **historical to near-real time data** that do not require live processes. They typically rely on local save files and the built-in keyframe system.

### Pre-made Datasets.

For ready-made data analysis, you may find it useful to use Confoederatio histmaps/livemaps instead. We typically divide such datasets as follows, along with corresponding metadata.

#### Histmap:

> [!NOTE] 
> Stadestér refers to urban data, whereas Velkscala refers to population data generally.

- Atlas: (Vector) - Polity data from 3000BC-2023AD, based off [Cliopatria](https://www.nature.com/articles/s41597-025-04516-9), and currently undergoing manual cleaning. Interpreter scripts can be found at SVEA in the `livemap` folder, and cleaned polygons at `saves/atlas.naissance`.
- Eoscala: (Raster) - Economic estimates (GDP PPP) from 10000BC-2023AD, (Gini) from 21500BC-1800AD [[point-based]](https://docs.google.com/spreadsheets/d/1WAn29290A2empQgYbvkp-qGcqMCtfyfz5DQ7I5p_rqs/edit?gid=0#gid=0) at 5-arcmin resolution.
  - [[Dataset]](https://github.com/Confoederatio/Eoscala-Velkscala) | [[Methodology]](https://confoederatio.org/papers/Eoscala%201.0_Velkscala%200.5_%20A%20Gridded%20Reconstruction%20of%20Global%20GDP%20and%20Population%20from%2010000BC%20to%20the%20Present-4.pdf)
- Stadestér/Velkscala: (Raster/Vector) - Population estimates (rural, urban, total), land use and ALCC (from HYDE/LUH2KK10) from 10000BC-2025AD. Urban extents and locations are given as GeoJSON datasets, with individual pop. estimates for 41k+ cities between 3000BC-2025AD. Yearly urban extents are made available from 1800AD cities. 5-arcmin resolution.
  - [[Dataset (Github)]](https://github.com/Confoederatio/Stadester) | [[Dataset (Zenodo)]](https://zenodo.org/records/17180328) | [[Methodology]](https://confoederatio.org/papers/Stadest%C3%A9r%201.0%20-%20A%20Global%20Database%20of%2041000%2B%20Cities%20From%203000BC%20to%20the%20Present.pdf)

#### Livemap:

- Collation (Vector) - ORBATs and geospatialised news aggregation. Scripts for self-hosting are available [here](https://github.com/Confoederatio/SVEA).
- Deprojector (Beta; Raster) - Arbitrary projection-to-projection georeferencing using ML. These scripts are currently a proof-of-concept and not recommended for production.
  - [[Tool (Github)]](https://github.com/Confoederatio/Deprojector) 
