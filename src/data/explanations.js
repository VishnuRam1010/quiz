export const explanations = {
  1: {
    summary: "Finding factors that influence customer churn requires discovering correlations and predictive patterns in customer behavior data.",
    options: {
      A: "Data storage only securely persists raw data in databases or data lakes; it does not analyze or uncover customer churn factors.",
      B: "Pattern and relationship analysis applies statistical and machine learning methods to identify which customer attributes and behaviors correlate with churn.",
      C: "Data encryption is a security mechanism to prevent unauthorized access, not an analytical technique for discovering business patterns.",
      D: "File compression reduces file size for efficient storage or transmission, having no role in identifying behavioral patterns."
    }
  },
  2: {
    summary: "Variety refers to the diverse formats of Big Data, encompassing structured, semi-structured, and unstructured data like text, images, and video.",
    options: {
      A: "Volume refers to the massive physical size or quantity of data (e.g. terabytes or petabytes), not the diversity of data types.",
      B: "Velocity refers to the speed at which new data is generated and must be processed (e.g. real-time streams).",
      C: "Variety describes data coming in diverse formats simultaneously—structured numbers, unstructured text, audio, images, and video.",
      D: "Veracity refers to the trustworthiness, noise, and quality of the data, rather than the types of media present."
    }
  },
  3: {
    summary: "Velocity represents the rapid rate and frequency at which new data arrives and must be ingested or analyzed.",
    options: {
      A: "Variety refers to differing formats and structures of data, not the speed of incoming posts.",
      B: "Velocity highlights the extreme speed and throughput of data generation—in this case, millions of incoming posts every second.",
      C: "Value represents the business or practical worth extracted from data after analysis.",
      D: "Veracity refers to data integrity, accuracy, and reliability."
    }
  },
  4: {
    summary: "Data preparation (data cleaning/preprocessing) is mandatory before modeling to fix missing values, remove duplicates, and standardize formats.",
    options: {
      A: "Data modeling applies algorithms to clean data; feeding dirty data directly into models leads to invalid, biased results ('garbage in, garbage out').",
      B: "Data preparation directly addresses data hygiene by imputing missing values, removing duplicate records, and standardizing formatting.",
      C: "Data presentation communicates final insights to stakeholders at the end of the data science lifecycle, not before analysis.",
      D: "Data visualization creates charts to inspect trends, but does not by itself clean and restructure flawed records."
    }
  },
  5: {
    summary: "Observing that higher temperatures coincide with higher ice-cream sales is a classic identification of a positive relationship or correlation.",
    options: {
      A: "This observation reflects real-world sales behavior, not an error or issue with database storage.",
      B: "Observing two variables that change together demonstrates an empirical relationship or correlation discovered during exploratory data analysis (EDA).",
      C: "Discovering a real-world trend is the intended outcome of exploration, not a code defect.",
      D: "A database schema defines table structures and columns, not mathematical or behavioral correlations in the data."
    }
  },
  6: {
    summary: "Data modeling refers to training mathematical or statistical algorithms on historical data to predict future outcomes or classify patterns.",
    options: {
      A: "Collecting customer information belongs to the data retrieval or acquisition stage.",
      B: "Removing duplicate records is part of data preparation and cleaning.",
      C: "Building a machine learning model to predict customer churn is the definition of data modeling.",
      D: "Creating a slide deck or dashboard represents the presentation and communication phase."
    }
  },
  7: {
    summary: "The standard Data Science lifecycle proceeds logically: Retrieve data → Prepare/clean data → Explore data → Model data → Present findings.",
    options: {
      A: "4 → 2 → 5 → 1 → 3 follows the standard workflow: Data Retrieval (4) → Data Preparation (2) → Data Exploration (5) → Data Modeling (1) → Presentation (3).",
      B: "You cannot prepare data (2) before retrieving it (4), and you cannot present results (3) before modeling (1).",
      C: "Exploration (5) cannot be done effectively before initial preparation/cleaning (2).",
      D: "Exploration (5) cannot happen prior to retrieving (4) and preparing (2) the dataset."
    }
  },
  8: {
    summary: "The presentation stage requires translating technical findings into clear, actionable business language that non-technical stakeholders understand.",
    options: {
      A: "Data retrieval successfully obtained the data needed for analysis.",
      B: "Data preparation cleaned the data properly, as evidenced by successful modeling.",
      C: "Presentation failed because the analyst did not tailor technical jargon to the executive audience, preventing stakeholders from acting on the findings.",
      D: "Data modeling successfully found the pattern; the failure lay strictly in communicating the result."
    }
  },
  9: {
    summary: "The foundational '3 Vs' defining Big Data are Volume (scale), Velocity (speed), and Variety (diversity of formats).",
    options: {
      A: "Volume, Velocity, and Variety constitute the universally recognized core 3 Vs of Big Data.",
      B: "'Visual' and 'Virtual' are not standard Big Data defining dimensions.",
      C: "'Version' and 'Variable' are software development and statistical terms, not Big Data dimensions.",
      D: "'Virtual' and 'Visual' are not core Big Data characteristics."
    }
  },
  10: {
    summary: "Predicting patient health risks from clinical history is a hallmark predictive analytics application of Data Science.",
    options: {
      A: "Applying statistical and machine learning algorithms on health records to forecast patient disease risks is a classic Data Science application.",
      B: "Data compression merely reduces file sizes on disk, without predictive capabilities.",
      C: "Data formatting standardizes dates, text, and numbers into consistent structures.",
      D: "Data entry is the manual process of typing data into computer systems."
    }
  },
  11: {
    summary: "When an algorithm fails to maintain performance as data volume grows by orders of magnitude, it suffers from a scalability limitation.",
    options: {
      A: "Scalability is the ability of an algorithm, application, or system to handle growing amounts of work or data gracefully.",
      B: "Formatting deals with syntax and layout of data fields, not execution throughput across massive scales.",
      C: "Visualization deals with rendering charts and graphs.",
      D: "Syntax refers to grammar rules of programming languages; the program ran correctly on 1,000 records so syntax was fine."
    }
  },
  12: {
    summary: "When a dataset exceeds physical RAM, processing in smaller chunks (out-of-core computation) prevents out-of-memory crashes.",
    options: {
      A: "Loading a 50 GB dataset directly into 8 GB RAM causes immediate memory exhaustion (Out of Memory error) and system freezing.",
      B: "Chunking (streaming chunks into RAM, processing them, and releasing memory) allows arbitrarily large datasets to be processed on modest hardware.",
      C: "Converting to larger data types (e.g. int32 to int64) would increase memory consumption rather than reduce it.",
      D: "Duplicating the dataset doubles the storage requirement and worsens memory bottlenecks."
    }
  },
  13: {
    summary: "Distributed processing divides computational tasks across a cluster of networked computers to process massive volumes concurrently.",
    options: {
      A: "Distributed computing harnesses the collective CPU and memory of a cluster of computers working in parallel on partitioned data.",
      B: "Distributed computing requires data to operate; it does not eliminate data.",
      C: "Distributed architectures accelerate computation; they cannot guarantee algorithmic prediction accuracy.",
      D: "Distributed computing handles any data type, not just image conversion."
    }
  },
  14: {
    summary: "Data partitioning splits a massive dataset into manageable segments distributed across multiple storage nodes or disks.",
    options: {
      A: "Data visualization renders data into charts for human comprehension.",
      B: "Data partitioning breaks large datasets into smaller chunks (partitions) stored and managed across multiple cluster nodes.",
      C: "Data cleaning removes nulls, errors, and duplicates.",
      D: "Data normalization scales feature values into a standard numeric range (e.g. 0 to 1)."
    }
  },
  15: {
    summary: "Sampling selects a statistically representative subset of a population or massive dataset for faster, resource-efficient exploration.",
    options: {
      A: "Sampling draws a representative subset from a massive dataset, enabling rapid exploratory analysis and modeling without overloading hardware.",
      B: "Encryption transforms readable data into ciphertext for security purposes.",
      C: "Indexing builds lookup tables to accelerate search queries on databases.",
      D: "Merging joins two datasets together on shared keys."
    }
  },
  16: {
    summary: "Credit risk models prioritize historical repayment behavior and financial metrics because past payment patterns strongly predict future defaults.",
    options: {
      A: "An applicant's favorite color has zero statistical correlation or predictive power regarding debt repayment.",
      B: "Repayment history, credit score, debt-to-income ratio, and income stability are the primary predictive signals for credit risk assessment.",
      C: "Phone wallpapers are irrelevant to an individual's financial creditworthiness.",
      D: "Music preferences have no legal or empirical basis for evaluating loan solvency."
    }
  },
  17: {
    summary: "As datasets grow exponentially, hardware memory limits, CPU processing bottlenecks, and I/O latency become primary technical challenges.",
    options: {
      A: "Memory exhaustion, disk I/O throughput, and compute latency are the most critical engineering hurdles as data scales up.",
      B: "Physical keyboard size is unaffected by dataset dimensions.",
      C: "Monitor resolution does not change based on how many gigabytes are in a database.",
      D: "Font selection is purely an aesthetic choice unrelated to data volume."
    }
  },
  18: {
    summary: "Parallel processing divides work among multiple processors simultaneously, drastically reducing overall execution time.",
    options: {
      A: "Distributing work among 10 computers enables parallel execution, allowing tasks to complete in a fraction of the time required by a single machine.",
      B: "Data size remains unchanged; it is partitioned, not compressed or reduced.",
      C: "Distributing computation does not fix data errors; faulty data remains faulty across all machines.",
      D: "Storage is still required across the 10 nodes to hold the partitions."
    }
  },
  19: {
    summary: "Apache Hadoop is the foundational open-source framework for distributed storage (HDFS) and distributed processing (MapReduce) of Big Data.",
    options: {
      A: "Hadoop is the seminal framework designed specifically for distributed Big Data storage and processing across computer clusters.",
      B: "HTML is a markup language for building web page structures.",
      C: "CSS is a styling language for web design.",
      D: "Photoshop is a desktop graphic design and image manipulation software."
    }
  },
  20: {
    summary: "Comprehensive risk models evaluate multiple factors; high income alone does not compensate for repeated delinquency in loan repayments.",
    options: {
      A: "Considering only income would overlook the applicant's history of defaults, creating substantial financial risk for the lender.",
      B: "A robust risk model assesses multiple dimensions (income, repayment track record, existing liabilities) to form a balanced risk evaluation.",
      C: "Ignoring past delinquency is dangerous because payment history is the strongest predictor of future default.",
      D: "Automatic approval without accounting for missed payments exposes the institution to immediate bad-debt losses."
    }
  },
  21: {
    summary: "NumPy (Numerical Python) is optimized in C to deliver high-performance vector and matrix mathematical computations on large arrays.",
    options: {
      A: "NumPy provides vectorized operations, broadcasting, and low-level C implementations that execute numerical calculations orders of magnitude faster than pure Python.",
      B: "Flask is a lightweight Python web framework for building APIs and web servers.",
      C: "Tkinter is Python's standard library for building desktop Graphical User Interfaces (GUIs).",
      D: "BeautifulSoup is a library for parsing HTML and extracting data from web pages."
    }
  },
  22: {
    summary: "The n-dimensional array (ndarray) is NumPy's core data structure, providing fast, contiguous, homogenous numerical storage.",
    options: {
      A: "The `ndarray` is NumPy's central data structure: a homogeneous, multidimensional array with vectorized operations in compiled C.",
      B: "Series is a 1-dimensional labeled structure in Pandas, not the core of NumPy.",
      C: "Dictionary is Python's built-in key-value mapping structure.",
      D: "HTML document is a web document representation, completely unrelated to NumPy."
    }
  },
  23: {
    summary: "Slicing uses colon notation (e.g. arr[1:4]) to extract a contiguous sub-sequence from a list or array.",
    options: {
      A: "Slicing specifies start, stop, and step indices (e.g. arr[1:4]) to select a portion of an iterable sequence.",
      B: "Aggregation collapses multiple values into a single summary metric (e.g. sum, mean).",
      C: "GroupBy splits data into subsets based on category keys for group-wise computation.",
      D: "Scraping extracts data from web pages via HTTP and DOM parsing."
    }
  },
  24: {
    summary: "In NumPy, `np.array()` is the standard factory function used to construct an ndarray from a Python sequence.",
    options: {
      A: "`np.array([1, 2, 3])` is the correct, standard NumPy constructor that converts an iterable into an ndarray.",
      B: "`np.create()` is not a valid NumPy function and raises an AttributeError.",
      C: "`np.make()` does not exist in the NumPy API.",
      D: "`np.newarray()` does not exist in the NumPy module."
    }
  },
  25: {
    summary: "A Pandas Series is a one-dimensional labeled array capable of holding any data type with customizable axis labels.",
    options: {
      A: "A Pandas Series is specifically a 1-dimensional labeled data structure, perfect for indexed student marks.",
      B: "A DataFrame is a 2-dimensional tabular structure with rows and columns, suited for multiple variables rather than a single 1D sequence.",
      C: "A raw ndarray is homogeneous and lacks Pandas index alignment and label indexing features.",
      D: "A tuple is an immutable Python sequence that does not support labeled indexing or data science operations."
    }
  },
  26: {
    summary: "A Pandas DataFrame is a 2-dimensional labeled tabular data structure with columns of potentially different types, like a spreadsheet or SQL table.",
    options: {
      A: "A Series is strictly 1-dimensional (single column), whereas this dataset requires multiple named columns (Name, Age, Mark).",
      B: "A DataFrame is a 2-dimensional table with rows and named columns of varying types, ideal for tabular student records.",
      C: "A scalar represents a single individual value (e.g. integer 42), not a table.",
      D: "A string is a sequence of characters, not a structured tabular dataset."
    }
  },
  27: {
    summary: "`np.mean()` computes the arithmetic average along a specified array axis or across the entire array.",
    options: {
      A: "`np.mean()` calculates the arithmetic mean (sum of elements divided by total count) of array values.",
      B: "Finding the maximum is performed using `np.max()` or `np.amax()`, not `np.mean()`.",
      C: "Sorting array values is performed using `np.sort()`, not `np.mean()`.",
      D: "Counting strings is done via string or boolean mask operations, not numerical mean."
    }
  },
  28: {
    summary: "`np.sort()` returns a sorted copy of an array in ascending order.",
    options: {
      A: "`np.mean()` computes the numerical average of elements, not sorting.",
      B: "`np.sort()` sorts elements in ascending numerical order, converting [50, 10, 40, 20] into [10, 20, 40, 50].",
      C: "`np.search()` is not a valid sorting function in NumPy; binary searching uses `np.searchsorted()` on already sorted arrays.",
      D: "`np.count()` is not a standard array sorting function in NumPy."
    }
  },
  29: {
    summary: "Indexing retrieves a specific element or value from a sequence or array using its numerical position (index).",
    options: {
      A: "Indexing uses bracket notation (e.g. arr[0] or df.iloc[2]) to access elements directly by their positional index.",
      B: "Aggregation summarizes multiple values into one metric (such as sum or average).",
      C: "Grouping splits records into groups according to shared category values.",
      D: "Merging combines two tabular datasets based on common key columns."
    }
  },
  30: {
    summary: "A 3 × 4 × 2 structure has 3 dimensions (depth, rows, columns), represented in NumPy as an N-dimensional array (3D ndarray).",
    options: {
      A: "A 3 × 4 × 2 shape defines an N-dimensional array (specifically 3-dimensional) with 24 total numerical elements.",
      B: "A Pandas Series is strictly 1-dimensional and cannot hold a 3D structure natively.",
      C: "A CSS selector targets HTML markup nodes for web styling or web scraping.",
      D: "A pivot table is a 2D summary matrix aggregating rows and columns."
    }
  },
  31: {
    summary: "`df.groupby('city')['sales'].sum()` groups records by the city category before computing city-wise aggregates.",
    options: {
      A: "`groupby()` partitions records into subsets based on unique values in the 'city' column, enabling individual group calculations.",
      B: "Web scraping extracts data from website HTML, not analyzing data already loaded into memory.",
      C: "Slicing extracts contiguous rows or columns; it cannot group disparate city rows scattered throughout a dataset.",
      D: "Regular expressions match text patterns inside strings, not numerical group totals."
    }
  },
  32: {
    summary: "Aggregation transforms an array or grouped series into a single summary statistic such as sum, mean, count, min, or max.",
    options: {
      A: "Aggregation applies reduction functions (e.g. `sum()`, `mean()`, `count()`) across groups of data to compute summary values.",
      B: "Indexing accesses specific individual items by their location or key label.",
      C: "Scraping fetches content from web documents.",
      D: "Slicing extracts a range of elements without performing numerical computations."
    }
  },
  33: {
    summary: "A pivot table reorganizes and summarizes multidimensional data into an intuitive grid, placing products on one axis and regions on another.",
    options: {
      A: "A pivot table (`df.pivot_table()`) dynamically aggregates and cross-tabulates metrics with products as rows and regions as columns.",
      B: "Regular expressions parse and validate text strings, not numeric matrix summaries.",
      C: "CSS selectors find HTML nodes during web scraping.",
      D: "Array slicing extracts subarrays without grouping or summarizing dimensions."
    }
  },
  34: {
    summary: "In Pandas, `merge()` (equivalent to SQL JOIN) combines two DataFrames horizontally matching on a common key like Customer_ID.",
    options: {
      A: "`pd.merge(df1, df2, on='Customer_ID')` joins two DataFrames based on the shared 'Customer_ID' key column.",
      B: "A histogram is a graphical visualization of continuous numerical frequency distributions.",
      C: "GroupBy partitions a single DataFrame by category values to compute aggregated statistics.",
      D: "Sampling extracts a random subset of rows from a dataset."
    }
  },
  35: {
    summary: "Time Series analysis focuses on sequential data points indexed in chronological order over successive time intervals.",
    options: {
      A: "Time Series analysis deals specifically with data ordered chronologically by timestamps, enabling trend analysis and forecasting.",
      B: "Cross Tabulation examines contingency frequencies between categorical variables.",
      C: "String Manipulation performs text transformations such as splitting, trimming, or lowercasing.",
      D: "Regular Expression matches character patterns in strings."
    }
  },
  36: {
    summary: "Daily sales tracked sequentially from January to December represent chronological data points, which define Time Series data.",
    options: {
      A: "Sequential data recorded at regular time intervals (daily throughout the year) is the definition of time series data.",
      B: "Unstructured image data consists of pixel matrices representing photos or graphics, not daily monetary numbers.",
      C: "Static categorical data does not have a sequential, date-dependent chronological structure.",
      D: "CSS data consists of stylesheets defining web visual formatting rules."
    }
  },
  37: {
    summary: "Regular expressions (regex) are specialized pattern-matching strings designed to detect formats like email addresses, phone numbers, and URLs.",
    options: {
      A: "Regular expressions (e.g. `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}`) identify text patterns matching email syntax.",
      B: "Pivot tables aggregate tabular numeric figures; they cannot search unstructured paragraphs for email patterns.",
      C: "GroupBy aggregates structured rows in a DataFrame; it does not parse unstructured text for pattern matching.",
      D: "Array slicing selects elements by index; it cannot detect email syntax within arbitrary string content."
    }
  },
  38: {
    summary: "Reshaping alters the orientation and structure of data (e.g. melting wide data into long format, or pivoting) to fit analytical needs.",
    options: {
      A: "Reshaping rearranges rows and columns (e.g. pivoting, melting, stacking) to facilitate specific model inputs or visualizations without changing underlying data values.",
      B: "Reshaping restructures existing data; it does not generate new data records.",
      C: "Data encryption scrambles data for security, which is entirely distinct from DataFrame reshaping.",
      D: "Reshaping has nothing to do with removing the Python runtime."
    }
  },
  39: {
    summary: "Cross-tabulation (contingency table or `pd.crosstab`) computes frequency distributions across two or more categorical factors.",
    options: {
      A: "Cross-tabulation displays the joint frequency distribution of two categorical variables to reveal relationships or associations.",
      B: "Website loading speed is measured using network latency and web performance monitoring tools.",
      C: "Numerical dimensions are inspected via `.shape` or `.ndim`, not cross-tabulation.",
      D: "Python syntax errors are caught by the language compiler or linter, not data cross-tabulation."
    }
  },
  40: {
    summary: "Calculating the average salary per department requires grouping by department and applying the mean aggregation (`df.groupby('dept')['salary'].mean()`).",
    options: {
      A: "`df.groupby('department')['salary'].mean()` combines GroupBy to separate departments with aggregation to compute the average.",
      B: "Scraping extracts HTML from the internet and slicing extracts rows, neither of which computes group averages.",
      C: "Regex matches string patterns and merging joins tables together.",
      D: "Histograms plot frequency charts and CSS selectors identify web elements."
    }
  },
  41: {
    summary: "Web scraping uses automated scripts to request web pages, parse HTML markup, and extract specific structured information like prices and product titles.",
    options: {
      A: "Web scraping programmatically accesses web pages and extracts target text and attributes from HTML elements.",
      B: "Data modeling builds predictive algorithms (like regression or classification), not harvesting data from the web.",
      C: "Array slicing indexes arrays already in memory.",
      D: "GroupBy groups existing DataFrame records by column values."
    }
  },
  42: {
    summary: "CSS selectors are string patterns used to locate and isolate specific HTML tags, classes, or IDs during web scraping.",
    options: {
      A: "In web scraping, CSS selectors identify and query specific target elements (such as `div.price` or `h1.title`) in the HTML DOM tree.",
      B: "Averages are calculated using arithmetic functions, not CSS markup selectors.",
      C: "NumPy arrays are initialized using NumPy constructor functions like `np.array()`.",
      D: "Merging datasets is handled through database joins or `pd.merge()`."
    }
  },
  43: {
    summary: "A line plot connects chronological observations with lines, making it the most effective chart for showing temperature trends over time.",
    options: {
      A: "Line plots excel at visualizing continuous change and temporal trends over sequential time periods like seven days.",
      B: "Bar plots compare discrete categorical quantities, but are less intuitive for continuous temporal trend lines.",
      C: "Histograms display distribution frequencies across continuous numeric bins, not sequential daily temperatures.",
      D: "Scatter plots plot individual bivariate pairs without connecting lines showing sequential direction."
    }
  },
  44: {
    summary: "A bar plot represents discrete categories along one axis and counts along the other, ideal for comparing student counts across five departments.",
    options: {
      A: "A bar plot displays discrete categories (the five departments) on one axis and values (student counts) on the other, making comparisons immediate.",
      B: "Line plots are intended for continuous time series or ordered trends, not unordered discrete categories.",
      C: "Density plots illustrate continuous probability distributions rather than distinct categorical counts.",
      D: "Scatter plots explore the relationship between two continuous variables."
    }
  },
  45: {
    summary: "A histogram bins continuous values into intervals and shows the frequency of observations in each bin, displaying distribution shape.",
    options: {
      A: "A histogram groups continuous numerical exam scores into score intervals (bins) to reveal the distribution shape, skewness, and spread.",
      B: "Line plots connect sequential points, which is meaningless for an unordered set of 500 exam marks.",
      C: "Bar plots are designed for discrete categorical variables, whereas exam marks are continuous numerical data.",
      D: "Scatter plots require two variables to plot points on Cartesian coordinates."
    }
  },
  46: {
    summary: "A scatter plot plots two continuous numerical variables on Cartesian axes to inspect whether a correlation exists between them.",
    options: {
      A: "A scatter plot displays advertising spend on one axis and sales revenue on the other to reveal correlation patterns (e.g. positive linear trend).",
      B: "A histogram displays the frequency distribution of a single variable, not the correlation between two variables.",
      C: "A bar plot compares discrete categorical groupings rather than two continuous numerical variables.",
      D: "A density plot estimates the continuous probability distribution of a single metric."
    }
  },
  47: {
    summary: "Matplotlib is the foundational, most widely used plotting library in Python for creating static, animated, and interactive 2D charts.",
    options: {
      A: "Matplotlib (specifically `matplotlib.pyplot`) is the standard Python foundation library for creating a wide variety of static charts.",
      B: "Pandas is a data analysis and manipulation library, not a dedicated plotting engine (though it provides Matplotlib wrapper methods).",
      C: "NumPy provides numerical array operations and linear algebra, not graph plotting.",
      D: "Requests is an HTTP client library for making web requests and APIs."
    }
  },
  48: {
    summary: "Seaborn is built on top of Matplotlib, designed specifically for statistical visualization and tight integration with Pandas DataFrames.",
    options: {
      A: "Seaborn provides a high-level API built directly on Matplotlib that works seamlessly with Pandas DataFrames for statistical data graphics.",
      B: "Flask is a lightweight web server framework for building web applications and REST APIs.",
      C: "Tkinter is a desktop graphical user interface (GUI) toolkit.",
      D: "Django is a full-featured web application framework for backend web development."
    }
  },
  49: {
    summary: "A FacetGrid in Seaborn maps a dataset onto multiple subplot axes arranged in a grid based on categorical variable levels.",
    options: {
      A: "A Facet Grid splits a dataset across categorical subsets and renders the same plot type across multiple subplots in a synchronized grid.",
      B: "Array slicing extracts elements by index; it does not construct multi-plot graphical figure layouts.",
      C: "GroupBy splits data for tabular computation in Pandas, but does not render graphical subplot grids.",
      D: "CSS selectors select HTML nodes for web design or scraping, having no plotting capabilities."
    }
  },
  50: {
    summary: "Points in a scatter plot rising from bottom-left to top-right indicate a positive correlation: as the X variable increases, the Y variable also increases.",
    options: {
      A: "An upward pattern from left to right demonstrates a positive correlation, where higher values of the X variable correspond to higher values of the Y variable.",
      B: "An upward pattern is strong visual evidence of an existing relationship, contradicting the claim that no relationship can exist.",
      C: "Scatter plots typically plot two continuous numerical variables, not mandatory categorical variables.",
      D: "A positive relationship does not require either variable to follow a Gaussian normal distribution."
    }
  }
};

/** Get comprehensive explanation for a question and the student's selected option */
export function getExplanation(questionId, selectedOrig, correctOrig) {
  const item = explanations[questionId];
  if (!item) {
    return {
      summary: `The correct answer is Option ${correctOrig}.`,
      selectedWhy: selectedOrig === correctOrig ? 'This option is correct.' : 'This option does not satisfy the question criteria.',
      correctWhy: `Option ${correctOrig} correctly solves the problem described.`,
      allOptions: {}
    };
  }

  const selectedWhy = item.options[selectedOrig] || 'No specific explanation available for this option.';
  const correctWhy = item.options[correctOrig] || 'This is the verified correct answer.';

  return {
    summary: item.summary,
    selectedWhy,
    correctWhy,
    allOptions: item.options
  };
}
