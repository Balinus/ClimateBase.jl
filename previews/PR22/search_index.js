var documenterSearchIndex = {"docs":
[{"location":"#Introduction","page":"Introduction","title":"Introduction","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"ClimateBase is a Julia package offering basic functionality for analyzing data that are typically in the form used by climate sciences. These data are dimensional & spatiotemporal but the corresponding dimensions all need special handling. For example the most common dimensions are longitude, latitude and time.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"longitude is by definition a periodic dimension\nlatitude is a linear dimension. However because the coordinate system most often used in climate sciences is a grid of longitude × latitude (in equal degrees) the area element of space depends on latitude and this needs to be taken into account.\ntime is a linear dimension in principle, but its values are <: AbstractDateTime instead of <: Real. The human calendar (where these values come from) is periodic but each period may not correspond to the same physical time, and this also needs to be taken into account.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"ClimateBase is structured to deal with these intricacies, and in addition offer several functionalities commonly used, and sought after, by climate scientists. It also serves as the base building block for ClimateTools, which offers more advanced functionalities.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"The focus of ClimateBase is not loading data, nor operating on data on disk. It is designed for in-memory climate data exploration and manipulation. That being said, basic data loading functionality is offered in terms of NCDatasets, see below.","category":"page"},{"location":"#ClimArray:-the-core-data-structure","page":"Introduction","title":"ClimArray: the core data structure","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"This project treats \"climate data\" as a ClimArray, which uses the DimensionalData.jl interface. ClimArray is almost equivalent to DimensionalArray. A (brief) introduction to DimensionalData.jl is copied here from its docs, because basic knowledge of how to handle a ClimArray is assumed in our docs.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"DimensionalData.jl allows truly convenient handling of climate data, where it is important to be able to dimensionally-index data by their values.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"E.g. you can create an array with","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"using ClimateBase, Dates\r\nTime = ClimateBase.Ti # more intuitive\r\nlats = -90:5:90\r\nlons = 0:10:359\r\nt = Date(2000, 3, 15):Month(1):Date(2020, 3, 15)\r\ndimensions = (Lon(lons), Lat(lats), Time(t))\r\nA = ClimArray(rand(36, 37, 241), dimensions)","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"and then select a specific timeslice at Date(2011,5,15) and a longitude interval between 0 and 30 degrees like so:","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"B = A[Lon(Between(0, 30)), Time(At(Date(2011,5,15)))]","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"With ClimArray you can use convenience, physically-inspired functions that do automatic (and correct) weighting. For example the latitudinal mean of B is simply","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"C = latmean(B)","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"where in this averaging process each data point is weighted by the cosine of its latitude.","category":"page"},{"location":"#Making-a-ClimArray","page":"Introduction","title":"Making a ClimArray","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"You can create a ClimArray yourself, or you can load data from an .nc file with CF-conventions, using ClimArray.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"ClimArray(::AbstractArray, ::Tuple)","category":"page"},{"location":"#ClimateBase.ClimArray-Tuple{AbstractArray,Tuple}","page":"Introduction","title":"ClimateBase.ClimArray","text":"ClimArray(A::Array, dims::Tuple; name = \"\", attrib = nothing)\n\nClimArray is a structure that contains numerical array data bundled with dimensional information, a name and an attrib field (typically a dictionary) that holds general attributes. You can think of ClimArray as a in-memory representation of a CFVariable.\n\nAt the moment, a ClimArray is using DimensionalArray from DimensionalData.jl, and all basic handling of ClimArray is offered by DimensionalData (see below).\n\nClimArray is created by passing in standard array data A and a tuple of dimensions dims.\n\nExample\n\nusing ClimateBase, Dates\nTime = ClimateBase.Ti # more intuitive name for time dimension\nlats = -90:5:90\nlons = 0:10:359\nt = Date(2000, 3, 15):Month(1):Date(2020, 3, 15)\n# dimensional information:\ndimensions = (Lon(lons), Lat(lats), Time(t))\ndata = rand(36, 37, 241) # numeric data\nA = ClimArray(data, dimensions)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Introduction","title":"Introduction","text":"It is strongly recommended to use the dimensions we export (because we dispatch on them and use their information):","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"using ClimateBase, DimensionalData # hide\r\nfor D in ClimateBase.STANDARD_DIMS\r\n    println(D, \" (full name = $(DimensionalData.name(D)))\")\r\nend","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"We explicitly assume that Lon, Lat are measured in degrees and not radians or meters (extremely important for spatial averaging processes).","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"ClimArray(::Union{String, Vector{String}})","category":"page"},{"location":"#ClimateBase.ClimArray-Tuple{Union{Array{String,1}, String}}","page":"Introduction","title":"ClimateBase.ClimArray","text":"ClimArray(file::NCDataset, var::String) -> A\n\nLoad the variable var from the file and convert it into a ClimArray which also contains the variable attributes as a dictionary.\n\nNotice that file should be an NCDataset, which allows you to lazily combine different .nc data (typically split by time), e.g.\n\nalldata = [\"toa_fluxes_2020_$(i).nc\" for i in 1:12]\nfile = NCDataset(alldata; aggdim = \"time\")\nA = ClimArray(file, \"tow_sw_all\")\n\n(of course you can just do NCDataset(\"file.nc\") for single files).\n\nIf there are no missing values in the data (according to CF standards), the returned array is automatically converted to a concrete type (i.e. Union{Float32, Missing} becomes Float32).\n\nAt the moment, support for auto-loading equal area space types does not exist, see Types of spatial coordinates. But you can easily transform them yourself into a ClimArray by doing e.g.:\n\nfile = NCDataset(\"some_file_with_eqarea.nc\")\nlons = file[\"lon\"]\nlats = file[\"lat\"]\ncoords = [SVector(lo, la) for (lo, la) in zip(lons, lats)]\nt = file[\"time\"]\ndimensions = (Coord(coords), Time(t))\ndata = file[\"actual_data_like_radiation\"]\nA = ClimArray(data, dimensions)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Introduction","title":"Introduction","text":"Notice that (at the moment) we use a pre-defined mapping of common names to proper dimensions - please feel free to extend the following via a Pull Request:","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"using ClimateBase # hide\r\nClimateBase.COMMONNAMES","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"Also, two convenience functions are provided for examining the content of on-disk .nc files without loading all data on memory.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"nckeys\r\nncdetails","category":"page"},{"location":"#ClimateBase.nckeys","page":"Introduction","title":"ClimateBase.nckeys","text":"nckeys(file::String)\n\nReturn all keys of the .nc file in file.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.ncdetails","page":"Introduction","title":"ClimateBase.ncdetails","text":"ncdetails(file::String, io = stdout)\n\nPrint details about the .nc file in file on io.\n\n\n\n\n\n","category":"function"},{"location":"#Temporal","page":"Introduction","title":"Temporal","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"Functions related with the Time dimension.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"timemean\r\ntimeagg\r\nmonthlyagg\r\nyearlyagg\r\ntemporalrange\r\nmaxyearspan\r\ntemporal_sampling\r\ntime_in_days","category":"page"},{"location":"#ClimateBase.timemean","page":"Introduction","title":"ClimateBase.timemean","text":"timemean(A::ClimArray [, w]) = timeagg(mean, A, w)\n\nTemporal average of A.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.timeagg","page":"Introduction","title":"ClimateBase.timeagg","text":"timeagg(f, A::ClimArray, W = nothing)\n\nPerform a proper temporal aggregation of the function f (e.g. mean, std) on A (assuming monthly spaced data) where:\n\nOnly full year spans of A are included, see maxyearspan (because most processes are affected by yearly cycle, and averaging over an uneven number of cycles typically results in artifacts)\nEach month in A is weighted with its length in days (for monthly sampled data)\n\nIf you don't want these features, just do dropagg(f, A, Time, W).\n\nW are possible statistical weights that are used in conjuction to the temporal weighting, to weight each time point differently. If they are not a vector (a weight for each time point), then they have to be a dimensional array of same dimensional layout as A (a weight for each data point).\n\ntimeagg(f, t::Vector, x::Vector, w = nothing)\n\nSame as above, but for arbitrary vector x accompanied by time vector t.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.monthlyagg","page":"Introduction","title":"ClimateBase.monthlyagg","text":"monthlyagg(A::ClimArray, f = mean) -> B\n\nCreate a new array where the temporal daily information has been aggregated to months using the function f. By convention, the dates of the new array always have day number of 15.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.yearlyagg","page":"Introduction","title":"ClimateBase.yearlyagg","text":"yearlyagg(A::ClimArray, f = mean) -> B\n\nCreate a new array where the temporal information has been aggregated to years using the function f. By convention, the dates of the new array always have month and day number of 1.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.temporalrange","page":"Introduction","title":"ClimateBase.temporalrange","text":"temporalrange(t::AbstractVector{<:TimeType}}, f = Dates.month) → r\n\nReturn a vector of ranges so that each range of indices are values of t that belong in either the same month, year, or day, depending on f. f can take the values: Dates.year, Dates.month, Dates.day (functions).\n\nUsed in e.g. monthlyagg or yearlyagg.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.maxyearspan","page":"Introduction","title":"ClimateBase.maxyearspan","text":"maxyearspan(A::ClimArray) = maxyearspan(dims(A, Time))\nmaxyearspan(t::Vector{<:DateTime}) → i\n\nFind the maximum index i of t so that t[1:i] covers exact(*) multiples of years.\n\n(*) For monthly spaced data i is a multiple of 12 while for daily data we find the largest possible multiple of DAYS_IN_YEAR = 365.26.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.temporal_sampling","page":"Introduction","title":"ClimateBase.temporal_sampling","text":"temporal_sampling(x) → symbol\n\nReturn the temporal sampling type of x, which is either an array of Dates or a dimensional array (with Time dimension).\n\nPossible return values are:\n\n:yearly, where all dates have the same month+day, but different year.\n:monthly, where all dates have the same day, but different month.\n:daily, where the temporal difference between dates are exactly 1 day.\n:other, which means that x doesn't fall to any of the above categories.\n\nFor vector input, only the first 3 entries of the temporal information are used to deduce the sampling (while for ranges, checking the step is enough).\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.time_in_days","page":"Introduction","title":"ClimateBase.time_in_days","text":"time_in_days(t::AbstractArray{<:TimeType}, T = Float32)\n\nConvert a given date time array into measurement units of days: a real-valued array which counts time in days, always increasing.\n\n\n\n\n\n","category":"function"},{"location":"#Spatial","page":"Introduction","title":"Spatial","text":"","category":"section"},{"location":"#Types-of-spatial-coordinates","page":"Introduction","title":"Types of spatial coordinates","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"Most of the time the spatial information of your data is in the form of a Longitude × Latitude grid. This is simply achieved via the existence of two dimensions (Lon, Lat) in your dimensional data array. Height, although representing physical space as well, is not considered part of the \"spatial dimensions\", and is treated as any other additional dimension. This type of space is called Grid. It is assumed throughout that longitude and latitude are measured in degrees.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"Another type of spatial coordinates is supported, and that is of equal-area, called EqArea. There, the spatial dimension is instead given by a single Vector of coordinate locations, i.e. 2-element SVector(longitude, latitude). The dimension of this vector is Coord. Each point in this vector corresponds to a polygon (typically triangle or trapezoid) that covers equal amount of spatial area as any other point. The actual limits of each polygon are not included in the dimension. Typical examples of such equal area grids are reduced (or thinned) Gaussian grids or icosahedral-based grids.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"Within ClimateBase.jl aims to work with either type of spatial coordinate system. Therefore, physically inspired averaging functions, like spacemean or zonalmean, work for both types of spatial coordinates. In addition, the function spatialidxs returns an iterator over the spatial coordinates of the data, and works for both types (grid or equal-area):","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"spatialidxs","category":"page"},{"location":"#ClimateBase.spatialidxs","page":"Introduction","title":"ClimateBase.spatialidxs","text":"spatialidxs(A::ClimArray) → idxs\n\nReturn an iterable that can be used to access all spatial points of A with the syntax\n\nidxs = spatialidxs(A)\nfor i in idxs\n    slice_at_give_space_point = A[i...]\nend\n\nWorks for standard grid as well as equal area (... necessary because i is a Tuple).\n\n\n\n\n\n","category":"function"},{"location":"#Spatial-aggregation","page":"Introduction","title":"Spatial aggregation","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"zonalmean\r\nlatmean\r\nspacemean\r\nspaceagg\r\nhemispheric_means\r\nhemispheric_functions","category":"page"},{"location":"#ClimateBase.zonalmean","page":"Introduction","title":"ClimateBase.zonalmean","text":"zonalmean(A::ClimArray)\n\nReturn the zonal mean of A. Optionally do the mean for the data in range r of the longitude (r is fed into the dimension so it can be A range or an arbitrary selector).\n\nWorks for both grid and equal area space.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.latmean","page":"Introduction","title":"ClimateBase.latmean","text":"latmean(A::ClimArray [, r])\n\nReturn the latitude-mean A (mean across dimension Lat). Optionally do the mean for the data in range r of that dimension.\n\nThis function properly weights the mean by the cosine of the latitude.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.spacemean","page":"Introduction","title":"ClimateBase.spacemean","text":"spacemean(A::ClimArray [, w]) = spaceagg(mean, A, w)\n\nAverage given A over its spatial coordinates. Optionally provide statistical weights in w.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.spaceagg","page":"Introduction","title":"ClimateBase.spaceagg","text":"spaceagg(f, A::ClimArray, w = nothing)\n\nAggregate A using function f (e.g. mean) over all available space (i.e. longitude and latitude) of A, weighting every part of A by its spatial area. The function works for grid as well as equal area space.\n\nw can be extra weights, to weight each spatial point with. w can either be just an AbDimArray with same space as A, or of exactly same shape as A.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.hemispheric_means","page":"Introduction","title":"ClimateBase.hemispheric_means","text":"hemispheric_means(A) → nh, sh\n\nReturn the (proper) averages of A over the northern and southern hemispheres. Notice that this function explicitly does both zonal as well as meridional averaging. Use hemispheric_functions to just split A into two hemispheres.\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.hemispheric_functions","page":"Introduction","title":"ClimateBase.hemispheric_functions","text":"hemispheric_functions(A::ClimArray) → north, south\n\nReturn two arrays north, south, by splitting A to its northern and southern hemispheres, appropriately translating the latitudes of south so that both arrays have the same latitudinal dimension (and thus can be compared and do opperations between them).\n\n\n\n\n\n","category":"function"},{"location":"#General-aggregation","page":"Introduction","title":"General aggregation","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"The physical averages of the previous section are done by taking advantage of a general aggregation syntax, which works with any aggregating function like mean, sum, std, etc.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"dropagg\r\ncollapse","category":"page"},{"location":"#ClimateBase.dropagg","page":"Introduction","title":"ClimateBase.dropagg","text":"dropagg(f, A, dims)\n\nApply aggregating function f (e.g. sum) on array A across dimension(s) dims and drop the corresponding dimension(s) from the result (Julia inherently keeps singleton dimensions).\n\nIf A is one dimensional, dropagg will return the single number of applying f(A).\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.collapse","page":"Introduction","title":"ClimateBase.collapse","text":"collapse(f, A, dim)\n\nReduce A towards dimension dim using the collapsing function f (e.g. mean). This means that f is applied across all other dimensions of A, each of which are subsequently dropped, leaving only the collapsed result of A vs. the remaining dimension.\n\n\n\n\n\n","category":"function"},{"location":"#Timeseries-Analysis","page":"Introduction","title":"Timeseries Analysis","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"sinusoidal_continuation\r\nseasonal_decomposition","category":"page"},{"location":"#ClimateBase.sinusoidal_continuation","page":"Introduction","title":"ClimateBase.sinusoidal_continuation","text":"sinusoidal_continuation(T::ClimArray, fs = [1, 2]; Tmin = -Inf, Tmax = Inf)\n\nFill-in the missing values of spatiotemporal field T, by fitting sinusoidals to the non-missing values, and then using the fitted sinusoidals for the missing values.\n\nFrequencies are given per year (frequency 2 means 1/2 of a year).\n\nTmin, Tmax limits are used to clamp the result into this range (no clamping in the default case).\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.seasonal_decomposition","page":"Introduction","title":"ClimateBase.seasonal_decomposition","text":"seasonal_decomposition(A::ClimArray, fs = [1, 2]) → seasonal, residual\n\nDecompose A into a seasonal and residual components, where the seasonal contains the periodic parts of A, with frequencies given in fs, and residual contains what's left.\n\nfs is measured in 1/year. This function works even for non-equispaced time axis (e.g. monthly averages) and uses LPVSpectral.jl and SignalDecomposition.jl.\n\n\n\n\n\n","category":"function"},{"location":"#Climate-quantities","page":"Introduction","title":"Climate quantities","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"Functions that calculate climate-related quantities.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"insolation\r\nsurface_atmosphere_contributions\r\ntotal_toa_albedo","category":"page"},{"location":"#ClimateBase.insolation","page":"Introduction","title":"ClimateBase.insolation","text":"insolation(t, ϕ; kwargs...)\n\nCalculate daily averaged insolation in W/m² at given time and latitude t, φ. φ is given in degrees, and t in days (real number or date).\n\nKeywords:\n\nYa = DAYS_IN_YEAR # = 365.26 # days\nt_VE = 76.0 # days of vernal equinox\nS_0 = 1362.0 # W/m^2\nγ=23.44\nϖ=282.95\ne=0.017 # eccentricity\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.surface_atmosphere_contributions","page":"Introduction","title":"ClimateBase.surface_atmosphere_contributions","text":"surface_atmosphere_contributions(I, F_toa_⬆, F_s_⬆, F_s_⬇) → α_ATM, α_SFC\n\nCalculate the atmospheric and surface contributions of the planetary albedo, so that the TOA albedo is α = α_ATM + α_SFC, using the simple 1-layer radiative transfer model by Donohoe & Battisti (2011) or G. Stephens (2015). Stephens' formulas are incorrect and I have corrected them!\n\n\n\n\n\n","category":"function"},{"location":"#ClimateBase.total_toa_albedo","page":"Introduction","title":"ClimateBase.total_toa_albedo","text":"total_toa_albedo(a, s, t) = a + s*t^2/(1-a*s)\n\nCombine given atmosphere albedo a, surface albedo s and atmosphere transmittance t into a total top-of-the-atmosphere albedo α according to the model of Donohoe & Battisti (2011).\n\n\n\n\n\n","category":"function"},{"location":"#Crash-course-to-DimensionalData.jl","page":"Introduction","title":"Crash-course to DimensionalData.jl","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"DimensionalData","category":"page"},{"location":"#DimensionalData","page":"Introduction","title":"DimensionalData","text":"DimensionalData\n\n(Image: ) (Image: ) (Image: Build Status) (Image: Codecov) (Image: Aqua.jl Quality Assurance)\n\nDimensionalData.jl provides tools and abstractions for working with datasets that have named dimensions. It's a pluggable, generalised version of AxisArrays.jl with a cleaner syntax, and additional functionality found in NamedDimensions.jl. It has similar goals to pythons xarray, and is primarily written for use with spatial data in GeoData.jl.\n\nDimensions\n\nDimensions are just wrapper types. They store the dimension index and define details about the grid and other metadata, and are also used to index into the array, wrapping a value or a Selector. X, Y, Z and Ti are the exported defaults.\n\nA generalised Dim type is available to use arbitrary symbols to name dimensions. Custom dimensions can be defined using the @dim macro.\n\nWe can use dim wrappers for indexing, so that the dimension order in the underlying array does not need to be known:\n\njulia> using DimensionalData\n\njulia> A = DimArray(rand(40, 50), (X, Y));\n\njulia> A[Y(1), X(1:10)]\nDimArray with dimensions:\n X: 1:10 (NoIndex)\nand referenced dimensions:\n Y: 1 (NoIndex)\nand data: 10-element Array{Float64,1}\n[0.515774, 0.575247, 0.429075, 0.234041, 0.4484, 0.302562, 0.911098, 0.541537, 0.267234, 0.370663]\n\nAnd this has no runtime cost:\n\njulia> using BenchmarkTools\n\njulia> @btime A[X(1), Y(2)]\n  25.068 ns (1 allocation: 16 bytes)\n0.7302366320496405\n\njulia> @btime parent(A)[1, 2]\n  34.061 ns (1 allocation: 16 bytes)\n0.7302366320496405\n\nThe core component is the Dimension, and types that inherit from it, such as Time, X, Y, Z, the generic Dim{:x} or others you define manually using the @dim macro.\n\nDims can be used for indexing and views without knowing dimension order:\n\nA[X(10)]\nview(A, Y(30:40), X(1:20))\n\nAnd for indicating dimensions to reduce or permute in julia Base and Statistics functions that have dims arguments:\n\nusing Statistics\n\nA = DimArray(rand(10, 10, 100), (X, Y, Ti));\nmean(A, dims=Ti)\npermutedims(A, [Ti, Y, X])\n\nYou can also use arbitrary symbol to create Dim{X} dimensions:\n\njulia> A = DimArray(rand(10, 20, 30), (:a, :b, :c));\n\njulia> A[a=2:5, c=9]\n\nDimArray with dimensions:\n Dim{:a}: 2:5 (NoIndex)\n Dim{:b}: Base.OneTo(20) (NoIndex)\nand referenced dimensions:\n Dim{:c}: 9 (NoIndex)\nand data: 4×20 Array{Float64,2}\n 0.868237   0.528297   0.32389   …  0.89322   0.6776    0.604891\n 0.635544   0.0526766  0.965727     0.50829   0.661853  0.410173\n 0.732377   0.990363   0.728461     0.610426  0.283663  0.00224321\n 0.0849853  0.554705   0.594263     0.217618  0.198165  0.661853\n\nOther methods also work:\n\njulia> bounds(A, (:b, :c))\n\n((1, 20), (1, 30))\n\njulia> mean(A, dim=Dim{:b})\n\njulia> mean(A, dims=Dim{:b})\nDimArray with dimensions:\n Dim{:a}: Base.OneTo(10) (NoIndex)\n Dim{:b}: 1 (NoIndex)\n Dim{:c}: Base.OneTo(30) (NoIndex)\nand data: 10×1×30 Array{Float64,3}\n[:, :, 1]\n 0.543099\n 0.542407\n 0.540647\n 0.513554\n 0.601689\n 0.601558\n 0.46997\n 0.524254\n 0.601844\n 0.520966\n[and 29 more slices...]\n\nSelectors\n\nSelectors find indices in the dimension based on values At, Near, or Between the index value(s). They can be used in getindex, setindex! and view to select indices matching the passed in value(s)\n\nAt(x): get indices exactly matching the passed in value(s)\nNear(x): get the closest indices to the passed in value(s)\nWhere(f::Function): filter the array axis by a function of dimension index values.\nBetween(a, b): get all indices between two values (inclusive)\nContains(x): get indices where the value x falls in the interval. Only used for Sampled Intervals, for Points us At.\n\nWe can use selectors with dim wrappers:\n\nA[X(Between(1, 10)), Y(At(25.7))]\n\nWithout dim wrappers selectors must be in the right order:\n\nusing Unitful\n\njulia> A = DimArray(rand(10, 20), (X((1:10:100)u\"m\"), Ti((1:5:100)u\"s\")))\n\njulia> A[Between(10.5u\"m\", 50.5u\"m\"), Near(23u\"s\")]\nDimArray with dimensions:\n X: (11:10:41) m (Sampled: Ordered Regular Points)\nand referenced dimensions:\n Time (type Ti): 21 s (Sampled: Ordered Regular Points)\nand data: 4-element Array{Float64,1}\n[0.819172, 0.418113, 0.461722, 0.379877]\n\nFor values other than Int/AbstractArray/Colon (which are set aside for regular indexing) the At selector is assumed, and can be dropped completely:\n\njulia> A = DimArray(rand(3, 3), (X(Val((:a, :b, :c))), Y([25.6, 25.7, 25.8])))\nDimArray with dimensions:\n X: Val{(:a, :b, :c)}()\n Y: Float64[25.6, 25.7, 25.8]\nand data: 3×3 Array{Float64,2}\n 0.280308  0.92255    0.023938\n 0.129487  0.0993857  0.618391\n 0.246378  0.276186   0.0425624\n\njulia> A[:b, 25.8]\n0.61839141062599\n\nUsing all Val indexes (only recommended for small arrays) you can index with named dimensions At arbitrary values with no runtime cost:\n\nusing BenchmarkTools\n\njulia> A = DimArray(rand(3, 3), (cat=Val((:a, :b, :c)),\n                                 val=Val((5.0, 6.0, 7.0))))\nDimArray with dimensions:\n Dim{:cat}: Val{(:a, :b, :c)}() (Categorical: Unordered)\n Dim{:val}: Val{(5.0, 6.0, 7.0)}() (Categorical: Unordered)\nand data: 3×3 Array{Float64,2}\n 0.993357  0.765515  0.914423\n 0.405196  0.98223   0.330779\n 0.365312  0.388873  0.88732\n\njulia> @btime A[:a, 7.0]\n  26.333 ns (1 allocation: 16 bytes)\n0.32927504968939925\n\njulia> @btime A[cat=:a, val=7.0]\n  31.920 ns (2 allocations: 48 bytes)\n0.7476441117572306\n\nIt's also easy to write your own custom Selector if your need a different behaviour.\n\nExample usage:\n\nusing Dates, DimensionalData\ntimespan = DateTime(2001,1):Month(1):DateTime(2001,12)\nA = DimArray(rand(12,10), (Ti(timespan), X(10:10:100)))\n\njulia> A[X(Near(35)), Ti(At(DateTime(2001,5)))]\n0.658404535807791\n\njulia> A[Near(DateTime(2001, 5, 4)), Between(20, 50)]\nDimArray with dimensions:\n X: 20:10:50\nand referenced dimensions:\n Time (type Ti): 2001-05-01T00:00:00\nand data: 4-element Array{Float64,1}\n[0.456175, 0.737336, 0.658405, 0.520152]\n\nDim types or objects can be used instead of a dimension number in many Base and Statistics methods:\n\nMethods where dims can be used containing indices or Selectors\n\ngetindex, setindex! view\n\nMethods where dims can be used\n\nsize, axes, firstindex, lastindex\ncat\nreverse\ndropdims\nreduce, mapreduce\nsum, prod, maximum, minimum,\nmean, median, extrema, std, var, cor, cov\npermutedims, adjoint, transpose, Transpose\nmapslices, eachslice\nfill\n\nExample usage:\n\nA = DimArray(rand(20,10), (X, Y))\nsize(A, Y)\nusing Statistics\nmean(A, dims=X)\nstd(A; dims=Y())\n\nAlternate Packages\n\nThere are a lot of similar Julia packages in this space. AxisArrays.jl, NamedDims.jl, NamedArrays.jl are registered alternative that each cover some of the functionality provided by DimensionalData.jl. DimensionalData.jl should be able to replicate any of their functionality, although with slightly more verbose syntax and less polish in some cases. If there is anything it doesn't do that these packages can do, put in an issue with the feature request.\n\nAxisRanges.jl and AbstractIndices.jl are some other interesting developments. For more detail on why there are so many similar options and where things are headed, read this thread.\n\n\n\n\n\n","category":"module"}]
}
