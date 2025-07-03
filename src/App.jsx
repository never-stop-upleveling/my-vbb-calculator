import React, { useState, useEffect, useRef } from 'react';

function App() {
    const [currentPage, setCurrentPage] = useState('calculator'); // State to manage current page/tab

    // Calculator states
    const [csvData, setCsvData] = useState([]); // Raw parsed CSV data
    const [csvHeaders, setCsvHeaders] = useState([]); // Available headers from the CSV
    const [selectedSaleValue, setSelectedSaleValue] = useState(1000);
    const [selectedBudget, setSelectedBudget] = useState(100); // State for selected daily budget
    const [selectedBudgetUtilization, setSelectedBudgetUtilization] = useState(100); // New state for budget utilization percentage
    const [calculatedValues, setCalculatedValues] = useState([]);
    const [fileName, setFileName] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // Corrected: useState('') instead of = ''
    const [isParsing, setIsParsing] = useState(false);
    const [isPapaParseLoaded, setIsPapaParseLoaded] = useState(false);

    // States for user-selected column mappings
    const [salesColumn, setSalesColumn] = useState(''); // Single select for sales
    const [eventColumns, setEventColumns] = useState([]); // Multi-select for event columns
    const [constantColumns, setConstantColumns] = useState([]); // New state for columns with constant values
    const [outlierColumns, setOutlierColumns] = useState([]); // New state for columns with detected outliers
    const [vifFlaggedColumns, setVifFlaggedColumns] = useState([]); // New state for VIF flagged columns
    const [multicollinearityWarnings, setMulticollinearityWarnings] = useState([]); // New state for multicollinearity warnings

    // New state for transformation suggestion
    const [showTransformSuggestion, setShowTransformSuggestion] = useState(false);
    const [isLogTransformed, setIsLogTransformed] = useState(false);


    const fileInputRef = useRef(null);

    // Sale value options for the dropdown
    const saleValueOptions = Array.from({ length: 9 }, (_, i) => 1000 + i * 500); // $1000 to $5000 in $500 increments
    // Budget options for the dropdown
    const budgetOptions = [100, 500, 1000, 5000, 10000];
    // Budget Utilization percentage options
    const budgetUtilizationOptions = [100, 90, 80, 70, 60, 50];

    // Synthesized Sample CSV Data (as a Data URI)
    // This data is based on user's provided structure, with numbers cleaned and a 'Sales' column added.
    const userProvidedHeaders = `Week,Chat,Checkout - Credit Application - Complete,Checkout - CTC,Checkout - Sign Documents - Complete,Checkout - Trade In - Complete,Contact - Phone Link,Contact - Start a Chat,Create Account,Support - Contact Us,Vehicle Details - Request Details Submit,Vehicle Details - Request Details,Vehicle Details - Start Buying Process Continue,Vehicle Details - Trade-In Offer,Vehicle Search Results - View & Buy`;
    const userProvidedData = `6/9/2024,381,19,5,9,0,15,69,97,0,"1,629",82,506,0,"2,847"
6/16/2024,413,13,1,11,2,10,67,116,3,"1,799",77,520,0,"2,916"
6/23/2024,428,8,4,15,1,11,55,104,0,"1,817",105,562,0,"3,106"
6/30/2024,429,14,6,12,1,13,62,86,1,"1,707",108,541,0,"2,880"
7/7/2024,376,17,3,3,2,12,47,96,1,"1,641",79,499,0,"2,797"
7/14/2024,246,5,7,0,1,18,49,62,0,"1,482",85,419,0,"3,148"
7/21/2024,147,15,3,6,1,13,43,70,1,"1,464",98,433,0,"3,302"
7/28/2024,175,14,1,3,1,21,48,68,1,"1,465",92,428,0,"3,769"
8/4/2024,183,14,0,8,3,15,64,78,1,"1,711",129,504,0,"3,883"
8/11/2024,242,21,2,11,0,6,42,96,0,"1,601",109,477,0,"3,618"
8/18/2024,244,7,2,1,0,13,29,44,0,"1,261",80,376,0,"3,201"
8/25/2024,268,9,3,11,2,10,29,74,1,"1,384",106,427,0,"3,204"
9/1/2024,270,16,1,4,3,13,58,76,1,"1,441",106,284,0,"3,324"
9/8/2024,111,10,5,17,3,16,46,42,3,"1,288",107,95,0,"2,817"
9/15/2024,265,13,1,28,0,19,59,0,2,"1,523",103,141,0,"3,099"
9/22/2024,191,16,1,9,0,20,69,0,1,"1,359",85,109,0,"2,909"
9/29/2024,140,22,4,17,0,30,60,0,1,"1,458",65,154,0,"2,737"
10/6/2024,144,22,1,9,1,19,60,0,5,"1,271",98,131,0,"2,566"
10/13/2024,94,15,1,6,0,15,55,1,5,"1,302",135,103,0,"2,596"
10/20/2024,26,17,1,7,4,26,76,0,4,"1,380",95,114,0,"2,947"
10/27/2024,16,13,3,6,2,23,64,2,0,"1,375",111,138,0,"2,953"
11/3/2024,13,16,3,11,2,16,60,4,3,"1,469",111,140,0,"3,111"
11/10/2024,64,8,2,7,2,11,58,60,1,"1,624",97,124,0,"3,446"
11/17/2024,170,9,4,6,1,22,48,137,2,"1,541",158,163,0,"4,133"
11/24/2024,162,7,1,10,3,11,50,127,2,999,93,163,0,"3,775"
12/1/2024,153,6,4,8,3,19,52,119,2,"1,052",101,184,0,"4,130"
12/8/2024,224,15,2,8,2,23,56,158,1,"1,191",103,219,0,"5,062"
12/15/2024,263,7,5,16,1,21,71,160,1,"1,355",97,225,0,"5,595"
12/22/2024,177,12,2,2,0,13,44,148,1,"1,198",80,169,0,"5,014"
12/29/2024,133,2,0,2,0,1,13,62,1,662,37,73,0,"2,716"
1/5/2025,137,4,0,16,1,9,23,76,3,"1,139",66,135,0,"4,501"
1/12/2025,153,10,2,9,4,10,18,101,1,"1,195",69,137,0,"5,335"
1/19/2025,135,7,0,8,4,9,27,111,1,"1,246",80,174,0,"5,128"
1/26/2025,156,9,0,3,4,10,23,114,0,"1,265",74,158,0,"5,092"
2/2/2025,203,13,1,8,0,11,33,166,2,"2,039",89,225,0,"5,866"
2/9/2025,263,9,4,5,2,10,32,164,3,"2,105",105,192,0,"6,095"
2/16/2025,287,5,4,4,2,8,31,139,2,"1,691",97,182,0,"5,401"
2/23/2025,220,24,10,21,2,9,13,164,3,"1,233",103,228,0,"4,333"
3/2/2025,208,12,3,10,3,4,22,124,1,"1,170",73,189,0,"4,341"
3/9/2025,125,7,3,4,3,3,34,137,0,929,83,181,0,"4,251"
3/16/2025,111,13,6,3,3,4,39,119,0,883,72,175,2,"3,838"
3/23/2025,135,6,0,4,2,10,30,123,0,"1,024",94,172,0,"4,372"
3/30/2025,169,4,4,4,4,16,44,92,0,"1,044",72,192,1,"4,328"
4/6/2025,133,8,3,5,2,6,14,76,1,643,52,105,5,"2,839"
4/13/2025,253,8,3,6,0,25,55,150,1,"1,354",98,216,13,"5,445"
4/20/2025,251,3,1,6,1,16,23,154,2,"1,206",97,637,19,"5,001"
4/27/2025,276,13,2,12,3,10,48,172,2,"1,342",123,"1,073",36,"5,158"
5/4/2025,428,9,3,20,4,11,32,170,0,"3,492",124,"1,603",26,"5,355"
5/11/2025,525,13,2,15,3,19,45,193,4,"4,838",135,"2,299",35,"5,803"
5/18/2025,419,6,1,3,2,9,38,179,2,"5,426",108,"2,028",24,"5,300"
5/25/2025,676,15,1,9,1,16,45,238,0,"7,952",115,"2,984",30,"5,936"
6/1/2025,649,3,0,3,3,9,26,211,2,"9,426",107,"3,425",17,"4,671"
6/8/2025,466,20,2,10,6,17,21,204,0,"6,827",81,"2,580",20,"4,174"`;

    let finalSampleCsvContent = userProvidedHeaders.replace('Checkout - Sign Documents - Complete', 'Checkout - Sign Documents - Complete (SALE)') + "\n";
    const rowsArray = userProvidedData.split('\n').filter(row => row.trim() !== '');

    rowsArray.forEach((row, index) => {
        // Clean numbers with commas (e.g., "1,629" -> "1629") from the original row string
        // The regex looks for numbers that have commas inside them
        const cleanedRow = row.replace(/"(\d+),(\d+)"/g, (match, p1, p2) => p1 + p2);
        
        // Split the row by comma, then slice to remove the last original column's value (which was 'View & Buy')
        // and re-join. This effectively removes the last column's data.
        const columns = cleanedRow.split(',');
        // Assuming the last column was 'Vehicle Search Results - View & Buy' and we want to remove it
        // The original userProvidedHeaders has 15 columns.
        // So, we take the first 15 columns of data.
        const dataWithoutLastColumn = columns.slice(0, 15).join(','); 

        finalSampleCsvContent += dataWithoutLastColumn + `\n`;
    });

    const sampleCsvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(finalSampleCsvContent)}`;

    // New Sample Data for Feature Engineering Showcase
    const sampleFeatureEngineeringHeaders = `Week,Chat,Checkout - Credit Application - Complete,Checkout - CTC,Checkout - Sign Documents - Complete (SALE),Checkout - Trade In - Complete,Contact - Phone Link,Contact - Start a Chat,Create Account,Support - Contact Us,Vehicle Details - Request Details Submit,Vehicle Details - Request Details,Vehicle Details - Start Buying Process Continue,Vehicle Details - Trade-In Offer,Vehicle Search Results - View & Buy,Sales`;
    const sampleFeatureEngineeringData = `
01/01/2024,105,50,5,12,0,8,95,60,20,10,40,70,10,120,50
08/01/2024,110,52,5,13,0,9,100,62,22,11,42,72,11,125,55
15/01/2024,115,55,5,15,0,10,105,65,25,12,45,75,12,130,60
22/01/2024,120,58,5,11,0,10,110,58,22,11,43,73,11,128,58
29/01/2024,125,60,5,14,0,11,115,60,24,13,47,78,13,135,63
05/02/2024,130,62,5,13,0,12,120,62,23,12,45,75,12,132,60
12/02/2024,135,65,5,16,0,13,125,65,26,14,48,80,14,140,65
19/02/2024,140,68,5,18,0,14,130,68,28,15,50,82,15,145,70
26/02/2024,145,70,5,14,0,15,135,70,25,14,48,79,14,142,68
04/03/2024,150,72,5,12,0,16,140,72,23,13,45,76,13,138,65
11/03/2024,155,75,5,17,0,17,145,75,27,15,50,82,15,148,72
18/03/2024,160,78,5,19,0,18,150,78,29,16,53,85,16,155,75
25/03/2024,165,80,5,20,0,19,155,80,30,17,55,88,17,160,80
01/04/2024,170,82,5,250,0,20,160,82,700,18,58,90,18,170,85
08/04/2024,175,85,5,25,0,21,165,85,32,19,60,92,19,175,90
15/04/2024,180,88,5,26,0,22,170,88,34,20,62,95,20,180,95
22/04/2024,185,90,5,27,0,23,175,90,36,21,65,98,21,185,100
29/04/2024,190,92,5,28,0,24,180,92,38,22,68,100,22,190,105
06/05/2024,195,95,5,29,0,25,185,95,40,23,70,103,23,195,110
13/05/2024,200,97,5,30,0,26,190,97,42,24,72,105,24,200,115
20/05/2024,205,100,5,31,0,27,195,100,44,25,75,108,25,205,120
27/05/2024,210,102,5,32,0,28,200,102,46,26,77,110,26,210,125
03/06/2024,215,105,5,33,0,29,205,105,48,27,80,113,27,215,130
10/06/2024,220,108,5,34,0,30,210,108,50,28,82,115,28,220,135
17/06/2024,225,110,5,35,0,31,215,110,52,29,85,118,29,225,140
24/06/2024,230,112,5,36,0,32,220,112,54,30,87,120,30,230,145
`; // Sales is skewed (many low, few high)
    const sampleFeatureEngineeringCsvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(sampleFeatureEngineeringHeaders + "\n" + sampleFeatureEngineeringData)}`;


    // Helper for matrix operations
    // Transpose a matrix
    const matrixTranspose = (matrix) => {
        if (matrix.length === 0) return [];
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    };

    // Multiply two matrices
    const matrixMultiply = (matrixA, matrixB) => {
        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const rowsB = matrixB.length;
        const colsB = matrixB[0].length;

        if (colsA !== rowsB) {
            throw new Error(`Matrix dimensions mismatch for multiplication: A (rows ${rowsA}, cols ${colsA}), B (rows ${rowsB}, cols ${colsB})`);
        }

        const result = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
        return result;
    };

    // Invert a square matrix using Gauss-Jordan elimination
    const matrixInvert = (matrix) => {
        const size = matrix.length;
        if (size === 0 || matrix[0].length !== size) {
            throw new Error("Matrix must be square and non-empty for inversion.");
        }

        const identity = Array(size).fill(0).map((_, i) =>
            Array(size).fill(0).map((__, j) => (i === j ? 1 : 0))
        );

        // Create augmented matrix [A|I]
        const M = matrix.map((row, i) => [...row, ...identity[i]]);

        // Forward elimination and backward substitution
        for (let i = 0; i < size; i++) {
            // Find pivot for current column
            let maxRow = i;
            for (let k = i + 1; k < size; k++) {
                if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
                    maxRow = k;
                }
            }
            [M[i], M[maxRow]] = [M[maxRow], M[i]]; // Swap rows

            let pivot = M[i][i];
            if (Math.abs(pivot) < 1e-9) { // Check for near-zero pivot (singularity)
                throw new Error("Matrix is singular or near-singular, cannot invert. This might be due to highly correlated data (multicollinearity) or insufficient unique data points.");
            }

            // Divide current row by pivot to make M[i][i] = 1
            for (let j = i; j < 2 * size; j++) {
                M[i][j] /= pivot;
            }

            // Eliminate other rows (make M[k][i] = 0)
            for (let k = 0; k < size; k++) {
                if (k !== i) {
                    let factor = M[k][i];
                    for (let j = i; j < 2 * size; j++) {
                        M[k][j] -= factor * M[i][j];
                    }
                }
            }
        }

        // Extract inverse (right half of the augmented matrix)
        return M.map(row => row.slice(size));
    };

    // Effect to dynamically load PapaParse script
    useEffect(() => {
        if (typeof window.Papa !== 'undefined') {
            setIsPapaParseLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js";
        script.async = true;
        script.onload = () => {
            console.log("PapaParse script loaded successfully.");
            setIsPapaParseLoaded(true);
        };
        script.onerror = () => {
            console.error("Failed to load PapaParse script.");
            setErrorMessage("Failed to load PapaParse library. Please check your internet connection.");
            setIsPapaParseLoaded(false);
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Effect to trigger calculation when relevant data or selections change
    useEffect(() => {
        // Only calculate if PapaParse is loaded, CSV data is present, all required columns are selected
        // and there's actual data to process (enough points for regression: N > number of predictors + 1)
        if (isPapaParseLoaded && csvData.length > (eventColumns.length) && selectedSaleValue > 0 &&
            selectedBudget > 0 && selectedBudgetUtilization > 0 && salesColumn && eventColumns.length > 0) {
            calculateConversionValues(csvData, selectedSaleValue, salesColumn, eventColumns, selectedBudget, selectedBudgetUtilization, isLogTransformed);
        } else if (csvData.length === 0 || !salesColumn || eventColumns.length === 0) {
            setCalculatedValues([]); // Clear results if no CSV data or mappings incomplete
            if (csvData.length > 0 && (!salesColumn || eventColumns.length === 0)) {
                setErrorMessage('Please select the Target Column and at least one Conversion Event Column to calculate values.');
            }
        }
    }, [csvData, selectedSaleValue, selectedBudget, selectedBudgetUtilization, salesColumn, eventColumns, isLogTransformed, isPapaParseLoaded]);

    // Effect to check for multicollinearity warnings whenever eventColumns or csvData changes
    useEffect(() => {
        if (csvData.length > 0 && eventColumns.length > 1) { // Need at least two selected event columns to check correlation
            const warnings = checkCorrelatedEvents(csvData, eventColumns);
            setMulticollinearityWarnings(warnings);
        } else {
            setMulticollinearityWarnings([]); // Clear warnings if not enough columns selected or no data
        }
    }, [csvData, eventColumns]);

    // Effect to detect skewness and show transform suggestion when salesColumn changes or CSV data loads
    useEffect(() => {
        if (salesColumn && csvData.length > 0) {
            const salesValues = csvData.map(row => Number(row[salesColumn])).filter(val => Number.isFinite(val) && val >= 0);
            if (salesValues.length > 0) {
                const skewness = calculateSkewness(salesValues);
                // A common rule of thumb for significant skewness is abs(skewness) > 1 or 1.5
                if (Math.abs(skewness) > 1.5) {
                    setShowTransformSuggestion(true);
                } else {
                    setShowTransformSuggestion(false);
                    setIsLogTransformed(false); // Reset transformation state if skewness is low
                }
            } else {
                setShowTransformSuggestion(false);
                setIsLogTransformed(false);
            }
        } else {
            setShowTransformSuggestion(false);
            setIsLogTransformed(false);
        }
    }, [salesColumn, csvData]);


    /**
     * Handles file input change event.
     * @param {Event} event - The file change event.
     */
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            processCsvFile(file);
        } else {
            resetState();
        }
    };

    /**
     * Handles file drop event.
     * @param {Event} event - The drop event.
     */
    const handleDrop = (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove('border-blue-500');
        const file = event.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            setFileName(file.name);
            processCsvFile(file);
        } else {
            setErrorMessage('Please drop a valid CSV file.');
            resetState();
        }
    };

    /**
     * Handles drag over event for visual feedback.
     * @param {Event} event - The drag over event.
     */
    const handleDragOver = (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('border-blue-500');
    };

    /**
     * Handles drag leave event for visual feedback.
     * @param {Event} event - The drag leave event.
     */
    const handleDragLeave = (event) => {
        event.currentTarget.classList.remove('border-blue-500');
    };

    /**
     * Resets the application state to its initial values.
     */
    const resetState = () => {
        setFileName('');
        setCsvData([]);
        setCsvHeaders([]);
        setErrorMessage('');
        setCalculatedValues([]);
        setSalesColumn('');
        setEventColumns([]);
        setConstantColumns([]); // Reset constant columns
        setOutlierColumns([]); // Reset outlier columns
        setVifFlaggedColumns([]); // Reset VIF flagged columns
        setMulticollinearityWarnings([]); // Reset multicollinearity warnings
        setShowTransformSuggestion(false); // Reset transformation suggestion
        setIsLogTransformed(false); // Reset transformation state
        setSelectedSaleValue(1000); // Reset sale value
        setSelectedBudget(100); // Reset budget
        setSelectedBudgetUtilization(100); // Reset budget utilization
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the file input visually
        }
    };

    /**
     * Processes the uploaded CSV file using PapaParse.
     * Extracts headers and raw data for further processing.
     * @param {File} file - The CSV file to process.
     */
    const processCsvFile = (file) => {
        setIsParsing(true);
        setErrorMessage('');
        setCalculatedValues([]);
        setCsvHeaders([]); // Clear previous headers
        setSalesColumn(''); // Reset column selections
        setEventColumns([]);
        setConstantColumns([]); // Reset constant columns
        setOutlierColumns([]); // Reset outlier columns
        setVifFlaggedColumns([]); // Reset VIF flagged columns
        setMulticollinearityWarnings([]); // Reset multicollinearity warnings
        setShowTransformSuggestion(false); // Reset transformation suggestion
        setIsLogTransformed(false); // Reset transformation state

        if (!isPapaParseLoaded || typeof window.Papa === 'undefined') {
            setErrorMessage('CSV parsing library is still loading or failed to load. Please try again in a moment.');
            setIsParsing(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                window.Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true, // Let PapaParse try to convert to numbers, but we'll clean them first
                    transform: (value, field) => { // Custom transform to remove commas from potential numbers
                        if (typeof value === 'string' && value.match(/^\d{1,3}(,\d{3})*(\.\d+)?$/)) {
                            return Number(value.replace(/,/g, ''));
                        }
                        return value;
                    },
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            console.error("PapaParse errors:", results.errors);
                            setErrorMessage(`CSV parsing errors: ${results.errors[0].message}`);
                            resetState();
                        } else {
                            if (results.data.length === 0) {
                                setErrorMessage('CSV file is empty or contains no valid data rows.');
                                resetState();
                                setIsParsing(false);
                                return;
                            }
                            if (results.meta.fields && results.meta.fields.length > 0) {
                                // Filter out date/time columns from the raw headers
                                const allHeaders = results.meta.fields;
                                const nonDateHeaders = allHeaders.filter(header => !isDateColumn(header));
                                setCsvHeaders(nonDateHeaders); // Store only eligible headers

                                const detectedConstantColumns = [];
                                const detectedOutlierColumns = [];

                                if (results.data.length > 1) {
                                    nonDateHeaders.forEach(header => {
                                        const columnValues = results.data.map(row => Number(row[header]));

                                        if (columnValues.some(isNaN)) {
                                            // Skip non-numerical columns for constancy and outlier checks
                                            return;
                                        }

                                        // Check for constant values
                                        const firstValue = columnValues[0];
                                        let isConstant = true;
                                        for (let i = 1; i < columnValues.length; i++) {
                                            if (columnValues[i] !== firstValue) {
                                                isConstant = false;
                                                break;
                                            }
                                        }
                                        if (isConstant) {
                                            detectedConstantColumns.push(header);
                                        }

                                        // Check for outliers (only if not constant)
                                        if (!isConstant && detectOutliers(columnValues)) {
                                            detectedOutlierColumns.push(header);
                                        }
                                    });
                                }
                                setConstantColumns(detectedConstantColumns);
                                setOutlierColumns(detectedOutlierColumns);

                                // After identifying constant and outlier columns, calculate VIFs for eligible predictors
                                const eligiblePredictorHeadersForVIF = nonDateHeaders.filter(header =>
                                    !detectedConstantColumns.includes(header) &&
                                    !detectedOutlierColumns.includes(header)
                                );
                                const vifFlagged = calculateVIFs(results.data, eligiblePredictorHeadersForVIF);
                                setVifFlaggedColumns(vifFlagged);


                                // Attempt to auto-select common sales column names from filtered headers
                                if (nonDateHeaders.includes('Sales')) setSalesColumn('Sales');
                                else if (nonDateHeaders.includes('sales')) setSalesColumn('sales');
                                else if (nonDateHeaders.includes('Automotive_Sales')) setSalesColumn('Automotive_Sales');
                                else if (nonDateHeaders.includes('Checkout - Sign Documents - Complete (SALE)')) setSalesColumn('Checkout - Sign Documents - Complete (SALE)');

                            } else {
                                setErrorMessage('CSV has no valid headers.');
                                resetState();
                                setIsParsing(false);
                                return;
                            }
                            setCsvData(results.data);
                        }
                        setIsParsing(false);
                    },
                    error: (error) => {
                        setErrorMessage(`Error parsing CSV: ${error.message}`);
                        setIsParsing(false);
                        resetState();
                    }
                });
            } catch (err) {
                setErrorMessage(`An unexpected error occurred: ${err.message}`);
                setIsParsing(false);
                resetState();
            }
        };
        reader.onerror = () => {
            setErrorMessage('Failed to read file.');
            setIsParsing(false);
            resetState();
        };
        reader.readAsText(file);
    };

    /**
     * Determines if a column header is likely a date/time column.
     * @param {string} header - The column header string.
     * @returns {boolean} True if it's likely a date column, false otherwise.
     */
    const isDateColumn = (header) => {
        const lowerHeader = header.toLowerCase();
        return lowerHeader === 'week' ||
               lowerHeader === 'month' ||
               lowerHeader.includes('date') || // Catches 'date', 'start_date', 'end_date'
               lowerHeader.includes('time') || // Catches 'time', 'timestamp'
               lowerHeader.startsWith('day') ||
               lowerHeader.startsWith('period'); // Added 'period' for common time-series headers
    };

    /**
     * Detects if an array of numbers contains outliers using the IQR method.
     * @param {Array<number>} arr - Array of numerical data.
     * @returns {boolean} True if outliers are detected, false otherwise.
     */
    const detectOutliers = (arr) => {
        if (arr.length < 3) return false; // Need at least 3 points for meaningful IQR
        
        // Filter out non-finite numbers (NaN, Infinity) before sorting
        const cleanArr = arr.filter(val => Number.isFinite(val));
        if (cleanArr.length < 3) return false;

        const sortedArr = [...cleanArr].sort((a, b) => a - b);
        
        // Calculate Q1 (25th percentile)
        const q1Index = Math.floor((sortedArr.length + 1) / 4) - 1;
        let q1 = sortedArr[q1Index];
        // For very small arrays where floor((N+1)/4)-1 might be negative
        if (q1Index < 0) q1 = sortedArr[0]; 

        // Calculate Q3 (75th percentile)
        const q3Index = Math.floor((sortedArr.length + 1) * 3 / 4) - 1;
        let q3 = sortedArr[q3Index];
        // For very small arrays where floor((N+1)*3/4)-1 might be out of bounds
        if (q3Index >= sortedArr.length) q3 = sortedArr[sortedArr.length - 1];

        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        return cleanArr.some(val => val < lowerBound || val > upperBound);
    };

    /**
     * Calculates the skewness of an array of numbers.
     * @param {Array<number>} arr - The array of numbers.
     * @returns {number} The skewness value.
     */
    const calculateSkewness = (arr) => {
        const n = arr.length;
        if (n < 3) return 0; // Not enough data for meaningful skewness
        const mean = arr.reduce((sum, x) => sum + x, 0) / n;
        const variance = arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
        const stdDev = Math.sqrt(variance);
        if (stdDev === 0) return 0; // Avoid division by zero if all values are the same
        const moment3 = arr.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0) / n;
        return moment3 / Math.pow(stdDev, 3);
    };

    /**
     * Handles change for event column checkboxes.
     * @param {string} columnName - The name of the column toggled.
     */
    const handleEventColumnChange = (columnName) => {
        setEventColumns(prev =>
            prev.includes(columnName)
                ? prev.filter(col => col !== columnName)
                : [...prev, columnName]
        );
    };

    // Function to calculate Pearson correlation coefficient
    const calculateCorrelation = (arr1, arr2) => {
        const n = arr1.length;
        if (n === 0 || arr1.length !== arr2.length) return 0;

        const sum1 = arr1.reduce((a, b) => a + b, 0);
        const sum2 = arr2.reduce((a, b) => a + b, 0);
        const sum1_sq = arr1.reduce((a, b) => a + b * b, 0);
        const sum2_sq = arr2.reduce((a, b) => a + b * b, 0);
        const pSum = arr1.reduce((a, b, i) => a + b * arr2[i], 0);

        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt((sum1_sq - sum1 * sum1 / n) * (sum2_sq - sum2 * sum2 / n));

        if (den === 0) return 0; // Avoid division by zero for constant arrays (though these should be filtered)
        return num / den;
    };

    // Function to check for highly correlated event columns among SELECTED ones (for warning message)
    const checkCorrelatedEvents = (data, selectedEventColumns) => {
        const warnings = [];
        const numCols = selectedEventColumns.length;

        if (numCols < 2) return []; // Need at least two columns to check for correlation

        for (let i = 0; i < numCols; i++) {
            for (let j = i + 1; j < numCols; j++) {
                const col1Name = selectedEventColumns[i];
                const col2Name = selectedEventColumns[j];

                // Only check correlation for non-problematic columns
                if (constantColumns.includes(col1Name) || outlierColumns.includes(col1Name) ||
                    constantColumns.includes(col2Name) || outlierColumns.includes(col2Name)) {
                    continue; // Skip if one of them is already constant/outlier flagged
                }

                const arr1 = data.map(row => Number(row[col1Name])).filter(val => !isNaN(val));
                const arr2 = data.map(row => Number(row[col2Name])).filter(val => !isNaN(val));

                if (arr1.length === arr2.length && arr1.length > 1) {
                    const correlation = calculateCorrelation(arr1, arr2);
                    if (Math.abs(correlation) > 0.95) { // Threshold for high correlation (e.g., 0.95)
                        warnings.push(`'${col1Name}' and '${col2Name}' are highly correlated (r=${correlation.toFixed(2)}).`);
                    }
                }
            }
        }
        return warnings;
    };

    /**
     * Calculates VIF for a list of potential predictor columns in the dataset.
     * Flags columns with VIF > threshold.
     * @param {Array<Object>} data - The full dataset.
     * @param {Array<string>} potentialPredictors - Headers of columns to check VIF for.
     * @returns {Array<string>} List of column names flagged due to high VIF.
     */
    const calculateVIFs = (data, potentialPredictors) => {
        const flaggedVIFs = [];
        const N = data.length;
        const VIF_THRESHOLD = 5.0; // Common threshold for problematic VIF

        // Filter out any predictors that are non-numerical or have constant/outlier issues already
        const cleanPredictors = potentialPredictors.filter(header => {
            const values = data.map(row => Number.isFinite(Number(row[header]))); // Check if values can be numbers
            return !values.some(val => val === false) && !constantColumns.includes(header) && !outlierColumns.includes(header);
        });

        if (N <= cleanPredictors.length) {
            // Not enough rows to calculate VIF accurately for all predictors.
            return [];
        }

        if (cleanPredictors.length < 2) { // Need at least two clean predictors to run a regression for VIF
            return [];
        }

        cleanPredictors.forEach(targetVIFCol => {
            // Y for this VIF mini-regression is the current targetVIFCol
            const Y_vif_array = data.map(row => Number(row[targetVIFCol]));
            const Y_vif_matrix = Y_vif_array.map(y => [y]);

            // X for this VIF mini-regression is all *other* clean predictors
            const X_vif_predictor_cols = cleanPredictors.filter(col => col !== targetVIFCol);

            // If there are no other predictors, VIF is 1 (no multicollinearity)
            if (X_vif_predictor_cols.length === 0) {
                return; // VIF is 1, so not flagged
            }

            // Build X matrix for VIF calculation (with intercept)
            let X_vif_matrix = Array(N).fill(0).map(() => [1]); // Intercept

            X_vif_predictor_cols.forEach(predictorCol => {
                const predictorArray = data.map(row => Number(row[predictorCol]));
                for (let i = 0; i < N; i++) {
                    X_vif_matrix[i].push(predictorArray[i]);
                }
            });

            try {
                const XT_vif = matrixTranspose(X_vif_matrix);
                const XTX_vif = matrixMultiply(XT_vif, X_vif_matrix);
                const XTX_inv_vif = matrixInvert(XTX_vif); // Can throw singularity error

                // Calculate R-squared for this mini-regression to get VIF
                // Predicted Y for this VIF regression
                const beta_vif = matrixMultiply(XTX_inv_vif, matrixMultiply(XT_vif, Y_vif_matrix));
                const Y_pred_vif = matrixMultiply(X_vif_matrix, beta_vif).map(val => val[0]); // Convert back to 1D array

                const totalSumOfSquares = Y_vif_array.reduce((sum, y) => sum + Math.pow(y - Y_vif_array.reduce((a,b) => a+b, 0) / N, 2), 0);
                const residualSumOfSquares = Y_vif_array.reduce((sum, y, i) => sum + Math.pow(y - Y_pred_vif[i], 2), 0);

                let rSquared = 0;
                if (totalSumOfSquares > 0) {
                    rSquared = 1 - (residualSumOfSquares / totalSumOfSquares);
                }

                const vif = 1 / (1 - rSquared);

                if (vif > VIF_THRESHOLD) {
                    flaggedVIFs.push(targetVIFCol);
                }

            } catch (error) {
                // If a VIF regression itself fails (e.g., due to perfect collinearity within predictors subset),
                // it implies a severe multicollinearity issue, so we should flag this column.
                console.warn(`VIF calculation for '${targetVIFCol}' failed, likely due to perfect multicollinearity in its sub-model. Flagging it.`);
                flaggedVIFs.push(targetVIFCol);
            }
        });
        return flaggedVIFs;
    };


    /**
     * Calculates the Google Ads conversion values using multiple linear regression.
     * @param {Array<Object>} data - Raw parsed CSV data.
     * @param {number} saleValue - The selected average sale value.
     * @param {string} salesCol - Name of the sales column.
     * @param {Array<string>} eventCols - Array of names of conversion event columns.
     * @param {number} budget - The selected daily budget.
     * @param {number} budgetUtilization - The percentage of budget to utilize for the top conversion.
     * @param {boolean} applyLogTransform - Whether to apply log1p transformation to the sales data.
     */
    const calculateConversionValues = (data, saleValue, salesCol, eventCols, budget, budgetUtilization, applyLogTransform) => {
        setErrorMessage(''); // Clear errors before calculation

        const N = data.length; // Number of data points (weeks/rows)

        // Filter out any event columns that are also sales column, date column, or constant or outlier-flagged or VIF-flagged
        const actualEventColsForCalculation = eventCols.filter(header =>
            header !== salesCol && !isDateColumn(header) && !constantColumns.includes(header) && !outlierColumns.includes(header) && !vifFlaggedColumns.includes(header)
        );

        if (actualEventColsForCalculation.length === 0) {
            setErrorMessage('No valid numerical conversion event data selected for calculation. Please ensure selected event columns contain numerical data, are not date/time columns, not constant values, do not contain significant outliers, and do not have high multicollinearity (VIF). Also, ensure they are not the same as the Target Column.');
            setCalculatedValues([]);
            return;
        }

        // Ensure enough data points for regression: N > number of predictors + 1 (for intercept)
        if (N <= actualEventColsForCalculation.length) {
            setErrorMessage(`Not enough unique data points for multiple linear regression. You need more rows (${N}) than selected valid event columns (${actualEventColsForCalculation.length}). Please provide at least ${actualEventColsForCalculation.length + 1} rows of data.`);
            setCalculatedValues([]);
            return;
        }

        // Prepare the dependent variable (Y - Sales)
        let salesArray = data.map(row => Number(row[salesCol]));
        if (salesArray.some(isNaN) || salesArray.length !== N) {
            setErrorMessage(`Invalid or missing numerical data in the selected Target Column ('${salesCol}').`);
            setCalculatedValues([]);
            return;
        }

        // Apply log transformation if selected
        if (applyLogTransform) {
            // Use log1p to handle potential zero values in sales
            salesArray = salesArray.map(y => Math.log1p(y >= 0 ? y : 0)); // Ensure non-negative before log
        }
        
        const Y_matrix = salesArray.map(y => [y]); // Convert to column vector for matrix multiplication

        // Prepare the design matrix (X - Event Occurrences + Intercept)
        let X_matrix = Array(N).fill(0).map(() => [1]); // Start with intercept column (column of ones)

        actualEventColsForCalculation.forEach(eventColumn => {
            const eventOccurrencesArray = data.map(row => Number(row[eventColumn]));
            // Add column to X_matrix. We've already pre-filtered constant/invalid columns.
            for (let i = 0; i < N; i++) {
                X_matrix[i].push(eventOccurrencesArray[i]);
            }
        });


        try {
            // Beta coefficients = (X^T * X)^-1 * X^T * Y
            const XT = matrixTranspose(X_matrix);
            const XTX = matrixMultiply(XT, X_matrix);
            const XTX_inv = matrixInvert(XTX); // This is where singularity/multicollinearity can occur
            const XTy = matrixMultiply(XT, Y_matrix);
            const beta = matrixMultiply(XTX_inv, XTy);

            const unscaledResults = actualEventColsForCalculation.map((eventName, index) => {
                // Coefficients for predictors start from index 1 in beta (beta[0][0] is the intercept)
                let coefficient = beta[index + 1] ? beta[index + 1][0] : 0; // Get the single value from the [value] array

                // Interpret coefficient as "likelihood" or "contribution weight" per occurrence.
                // Cap it between 0 and 1 for practical use as a conversion multiplier.
                // Note: If Y was log-transformed, this coefficient is on the log scale.
                // We're still capping it for practical application as a relative multiplier.
                let likelihood = Math.max(0, Math.min(1, coefficient)); 

                return {
                    eventName: eventName,
                    likelihood: likelihood, // Store likelihood for sorting
                    unscaledCalculatedValue: saleValue * likelihood // Calculate the unscaled value
                };
            });

            // Find the maximum unscaled value among all calculated events
            let maxUnscaledValue = 0;
            if (unscaledResults.length > 0) {
                maxUnscaledValue = Math.max(...unscaledResults.map(item => item.unscaledCalculatedValue));
            }

            let finalScaleFactor = 1; // Default to no scaling
            const effectiveBudgetTarget = (budget * selectedBudgetUtilization) / 100; // Calculate the target value based on budget utilization

            // Apply scaling only if max unscaled value is positive and exceeds the effective budget target
            if (maxUnscaledValue > 0 && effectiveBudgetTarget > 0 && maxUnscaledValue > effectiveBudgetTarget) {
                finalScaleFactor = effectiveBudgetTarget / maxUnscaledValue;
            } else if (effectiveBudgetTarget === 0) { // If effective budget is zero, all values should be zero
                finalScaleFactor = 0;
            }

            const finalCalculatedValues = unscaledResults.map(item => {
                const scaledValue = (item.unscaledCalculatedValue * finalScaleFactor).toFixed(2);
                return {
                    eventName: item.eventName,
                    probability: item.likelihood, // Keep the original likelihood (coefficient) for display
                    unscaledCalculatedValue: item.unscaledCalculatedValue,
                    scaledCalculatedValue: parseFloat(scaledValue)
                };
            }).sort((a, b) => b.probability - a.probability); // Sort by probability (likelihood) in descending order

            setCalculatedValues(finalCalculatedValues);

        } catch (error) {
            console.error("Regression error:", error);
            setErrorMessage(`An error occurred during regression: ${error.message}. This might be due to issues like highly correlated event columns (multicollinearity) among your selected variables, or insufficient unique data points. Please try adjusting your selected columns or providing more varied data.`);
            setCalculatedValues([]);
        }
    };

    // Helper to create a column selection dropdown (for single select like Sales Column)
    const ColumnSelect = ({ label, value, onChange, options }) => (
        <div className="mb-4">
            <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-1">
                Select {label} Column:
            </label>
            <select
                id={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white cursor-pointer"
            >
                <option value="">-- Select a column --</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );

    // VBB Methodology Page Content
    const VbbMethodology = () => (
        <div className="flex flex-col lg:flex-row bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200">
            {/* Table of Contents (Left Column) */}
            <div className="lg:w-1/4 lg:pr-6 mb-8 lg:mb-0 sticky top-0 self-start">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Contents</h2>
                <ul className="space-y-2 text-gray-700">
                    <li><a href="#summary" className="hover:text-indigo-600 transition-colors duration-200">High-Level Summary</a></li>
                    <li><a href="#creation-logic" className="hover:text-indigo-600 transition-colors duration-200">How Values Are Created</a></li>
                    <li><a href="#feature-engineering" className="hover:text-indigo-600 transition-colors duration-200">Robust Feature Engineering</a></li>
                    <li><a href="#regression-logic" className="hover:text-indigo-600 transition-colors duration-200">The Regression Logic</a></li>
                    <li><a href="#budget-filter" className="hover:text-indigo-600 transition-colors duration-200">Why a Daily Budget Filter?</a></li>
                    <li><a href="#budget-utilization" className="hover:text-indigo-600 transition-colors duration-200">Budget Utilization Percentage</a></li>
                </ul>
            </div>

            {/* Main Content (Right Column) */}
            <div className="lg:w-3/4 lg:pl-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center leading-tight">
                    <span className="text-indigo-600">VBB Methodology</span>: How It Works
                </h1>

                <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                    This page explains the smart logic behind the Value-Based Bidding Calculator.
                </p>

                <div id="summary" className="mb-10 pt-4"> {/* Added pt-4 for scroll padding */}
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                        High-Level Summary of the Tool
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The **Value-Based Bidding Calculator** is a simple, self-service tool designed specifically for automotive dealers. Its main purpose is to help you determine the best monetary "value" to assign to each of your different website actions (called **conversion events**) when setting up your Google Ads campaigns.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Instead of just counting how many times an action happens, this tool helps you assign a dollar amount that reflects how likely each action is to contribute to an actual car sale, optimizing your advertising budget for the most impactful customer behaviors.
                    </p>
                </div>

                <hr className="my-8 border-gray-200" />

                <div id="creation-logic" className="mb-10 pt-4"> {/* Added pt-4 for scroll padding */}
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                        How Conversion Values Are Created from Your Data
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The calculator makes these smart value recommendations by looking at your own historical data. Here's the simple process:
                    </p>

                    <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-2">
                        <li>
                            You upload a **CSV file** (like a spreadsheet) that contains your weekly performance data. This CSV should have:
                            <ul className="list-circle list-inside ml-5 mt-1 space-y-1">
                                <li>One column showing your **total automotive sales** for each week.</li>
                                <li>Other columns showing the **number of times each conversion event occurred** (e.g., how many "Vehicle Detail Page Views," "Test Drive Requests," or "Lead Form Submissions" you had) for those same weeks.</li>
                            </ul>
                        </li>
                        <li>
                            You then tell the calculator what your **"Target Average Sale Value"** is. This is your best estimate of the average profit or revenue you make from selling one car (e.g., $3,000).
                        </li>
                        <li>
                            You also provide your typical **"Daily Budget"** for Google Ads, and a **"Budget Utilization Percentage"** to guide the scaling.
                        </li>
                        <li>
                            The calculator then uses this information to figure out how much each conversion event "contributes" to your sales.
                        </li>
                    </ul>
                </div>

                <hr className="my-8 border-gray-200" />

                <div id="feature-engineering" className="mb-10 pt-4"> {/* Added pt-4 for scroll padding */}
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                        Robust Feature Engineering: Ensuring Model Validity
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Before calculating your conversion values, the calculator performs several automatic "feature engineering" checks. These are designed to ensure the quality of the data going into the regression model, preventing errors and leading to more reliable and interpretable results.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                        <li>
                            <strong className="text-indigo-700">Constant Value Column Exclusion:</strong>
                            <p className="mt-1">
                                **Why it's included:** If a column has the same value for every single row (e.g., a "Page Type" column where every entry is "VDP"), it provides no unique information to the regression model. Mathematically, it causes issues because there's no variance to explain.
                                <br />**What it checks for:** The calculator scans all numerical columns. If all values in a column are identical, that column's checkbox in the "Select Conversion Event Columns" list will be greyed out (disabled). A tooltip explains "Constant values: This column has no variance and cannot be used in the model."
                            </p>
                        </li>
                        <li>
                            <strong className="text-indigo-700">Outlier Detection:</strong>
                            <p className="mt-1">
                                **Why it's included:** Outliers are data points that are significantly different from the rest of the data (e.g., a week with unusually high or low conversions). These extreme values can disproportionately "pull" the regression line, skewing the calculated contributions of other variables and making the model less representative of typical performance.
                                <br />**What it checks for:** The calculator uses the Interquartile Range (IQR) method to identify extreme outliers within each numerical column. If significant outliers are detected, the variable's checkbox will be greyed out (disabled), and a tooltip will warn, "Outliers detected: This variable contains extreme values that can significantly skew regression results. Consider cleaning your data or using robust regression methods."
                            </p>
                        </li>
                        <li>
                            <strong className="text-indigo-700">Multicollinearity (Pairwise Correlation Warning):</strong>
                            <p className="mt-1">
                                **Why it's included:** Multicollinearity occurs when two or more predictor variables in your model are highly correlated with each other (e.g., if "Chat Engagements" and "Contact Form Submissions" almost always increase or decrease together). This makes it difficult for the regression model to isolate the unique contribution of each correlated variable, leading to unstable or unreliable coefficients.
                                <br />**What it checks for:** After you select your "Conversion Event Columns," the calculator performs a pairwise correlation check. If two selected variables have a very high correlation (e.g., above 0.95), a shaded warning box will appear, suggesting that you deselect one of them to improve model stability and interpretability.
                            </p>
                        </li>
                        <li>
                            <strong className="text-indigo-700">Variance Inflation Factor (VIF) Check:</strong>
                            <p className="mt-1">
                                **Why it's included:** While pairwise correlation catches relationships between two variables, VIF provides a more comprehensive measure of multicollinearity. It quantifies how much the variance of a regression coefficient is "inflated" due to its correlation with *all other* selected predictor variables combined. A high VIF (typically above 5) indicates problematic multicollinearity that can severely impact the reliability of your coefficients.
                                <br />**What it checks for:** For all eligible numerical columns (those not constant or flagged as outliers), the calculator computes their VIF. Any column with a VIF greater than 5 is automatically greyed out (disabled) in the selection list. A tooltip explains, "High multicollinearity (VIF &gt; 5): This variable is highly correlated with other potential predictors, which can make the model unstable or difficult to interpret."
                            </p>
                        </li>
                        <li>
                            <strong className="text-indigo-700">Logarithmic Transformation for Skewed Data:</strong>
                            <p className="mt-1">
                                **Why it's included:** Linear regression models perform best when the relationship between variables is linear and the data distributions are relatively normal. If your "Target Column" (e.g., sales data) is highly skewed (meaning many small values and a few very large ones), this can violate the assumptions of linear regression, leading to less accurate and less reliable coefficient estimates. A logarithmic transformation (like `log(1+x)`) can help to normalize such skewed data and linearize relationships, improving the model's fit and the interpretability of coefficients.
                                <br />**What it checks for:** The calculator analyzes the skewness of your selected "Target Column." If the data is significantly skewed (absolute skewness greater than 1.5), a suggestion will appear on the calculator tab, offering a toggle switch to apply a logarithmic transformation to your sales data before running the regression. This allows you to choose to optimize the model's performance for your specific data distribution.
                            </p>
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                        These automated checks act as guardrails, helping you select the most appropriate and statistically sound variables from your dataset. By guiding you away from problematic columns, the calculator ensures that the multiple linear regression model can produce the most accurate and actionable conversion values for your Google Ads campaigns.
                    </p>
                </div>

                <hr className="my-8 border-gray-200" />

                <div id="regression-logic" className="mb-10 pt-4"> {/* Added pt-4 for scroll padding */}
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                        The Logic Behind Determining the Values: Multiple Linear Regression
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Instead of just looking at each conversion event on its own, this calculator uses a statistical method called **Multiple Linear Regression**. Think of it like trying to understand how different ingredients in a recipe (your conversion events) all come together to create a delicious cake (your total sales).
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-4">
                        Here's the core idea:
                    </p>

                    <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-2">
                        <li>
                            The calculator analyzes your uploaded weekly data to find the **relationship between all your selected conversion events and your weekly sales, simultaneously.** It asks: "When Event A happens more, and Event B and C also happen, what's the typical impact on sales?"
                        </li>
                        <li>
                            For each conversion event, it calculates a **"contribution weight"**. This weight tells you, on average, how much an increase in that specific event's occurrences is associated with an increase in sales, *while also accounting for the changes in all your other selected events*.
                        </li>
                        <li>
                            This is powerful because it helps prevent overvaluing an event that might just naturally go up or down with another, more impactful event. It tries to isolate each event's unique contribution.
                        </li>
                    </ul>

                    <p className="text-gray-700 leading-relaxed">
                        First, this "contribution weight" (which is always between 0 and 1, where 1 means a very strong direct link to sales) is multiplied by your **"Target Average Sale Value."** This gives you the **Unscaled Google Ads Conversion Value**.
                    </p>
                </div>

                <hr className="my-8 border-gray-200" />

                <div id="budget-filter" className="mb-10 pt-4"> {/* Added pt-4 for scroll padding */}
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                        Why a Daily Budget Filter?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        While the "Unscaled Google Ads Conversion Value" tells you the true estimated worth of each conversion event, it might not always be practical for your daily Google Ads budget. For instance, if your daily budget is $100 and the calculated value for a "Test Drive" is $2,000, Google Ads' bidding system (especially "Maximize Conversion Value") might heavily prioritize trying to get just *one* of those $2,000 conversions.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        This could mean that your budget is entirely spent on trying to acquire a single, potentially rare or expensive conversion, causing you to miss out on multiple other valuable, but lower-cost, conversions that could have been acquired within that same day. The goal is to maximize *total* value for your account, not just the value of a single conversion.
                    </p>
                </div>

                <hr className="my-8 border-gray-200" />

                <div id="budget-utilization" className="mb-10 pt-4"> {/* Added pt-4 for scroll padding */}
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                        Introducing the Budget Utilization Percentage
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        To solve the problem of Google Ads potentially "holding out" for only the highest-value conversion, we introduce the **"Budget Utilization Percentage."** This allows you to set a cap on how much of your daily budget the *highest* calculated conversion value should represent.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Here's how it works:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-2">
                        <li>
                            If your daily budget is $100 and you set the "Budget Utilization Percentage" to 70%, the calculator will ensure that the highest "Scaled to Budget" conversion value is no more than $70.
                        </li>
                        <li>
                            All other conversion values will be scaled down proportionally, maintaining their relative importance to each other.
                        </li>
                        <li>
                            This creates "headroom" within your daily budget. Google Ads' Smart Bidding will still prioritize the higher-value conversions, but it will also understand that there's remaining budget to pursue other, less expensive, but still valuable conversions. This encourages the bidder to acquire a mix of conversions that collectively contribute more value throughout the day, rather than focusing solely on one.
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        For example, if the "Test Drive Request" event has an **Unscaled Conversion Value** of $2,400, your daily budget is $100, and you set the "Budget Utilization" to 70%, the effective budget target for the highest conversion is $70. The calculator will then scale the $2,400 down to a more realistic value, like $80 (and other events proportionally), to fit within your budget while maintaining its relative importance. This becomes the **Scaled Google Ads Conversion Value**.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        By using these data-driven and budget-aware values in Google Ads, you're guiding your campaigns to focus on the actions that statistically lead to the most valuable outcomes for your dealership – actual car sales – efficiently within your financial constraints!
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg mt-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Important Note on Scaling with High Budgets:</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            If your "Daily Google Ads Budget" is set very high (e.g., $10,000) and your **unscaled conversion values are naturally much lower** than your "effective budget target" (Budget × Utilization %), you'll notice that changing the "Budget Utilization Percentage" might not change the "Scaled to Budget" values. This is because the scaling only occurs when the highest unscaled value *exceeds* the effective budget target. If your conversions are already well within that target, no down-scaling is applied, and the scaled values will appear the same as the unscaled values. This means your budget is likely not a limiting factor for how Google Ads should value these conversions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // New component for "Why Value Based Bidding"
    const WhyVbb = () => (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center leading-tight">
                <span className="text-indigo-600">Why Adopt</span> Value-Based Bidding?
            </h1>

            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Discover how assigning specific values to your conversions can transform your Google Ads performance.
            </p>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                    What is Value-Based Bidding (VBB)?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    **Value-Based Bidding (VBB)** in Google Ads is a Smart Bidding strategy that tells Google to optimize for the **total conversion value** your campaigns generate, rather than just the raw number of conversions. With VBB, you assign a specific monetary value to each conversion action based on its actual or estimated contribution to your business's revenue or profit. This means instead of treating every 'lead' or 'website visit' as equal, you can tell Google which actions are truly more impactful to your bottom line.
                </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="mb-10">
                <h2 className="2xl font-semibold text-indigo-800 mb-4">
                    Why You Should Adopt This Strategy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Adopting Value-Based Bidding helps you move beyond simply getting "more conversions" to getting **"more valuable conversions."** Here are the key reasons why this strategy is a game-changer for automotive dealerships:
                </p>

                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                    <li>
                        <strong className="text-indigo-700">Maximize Revenue and Profit, Not Just Volume:</strong> Your dealership's ultimate goal isn't just clicks or even just leads; it's selling cars and generating profit. VBB directly aligns your bidding with this goal by prioritizing users and ad auctions that are statistically more likely to result in higher-value outcomes for your business.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Smart Allocation of Budget:</strong> VBB empowers Google Ads to intelligently allocate your budget to the ad auctions that are most likely to bring you the highest total value. For example, it might bid more aggressively for a user likely to book a test drive (which often has a high correlation with a sale) and less for a user who is only viewing a low-engagement page. This ensures your budget is working as hard as possible for you.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Optimize for True Business Impact:</strong> Different conversion events have varying impacts on your bottom line. A "Vehicle Detail Page (VDP) View" is valuable for engagement, but a "Test Drive Request" is significantly more valuable because it indicates a much higher intent to purchase. VBB allows you to reflect these real-world differences directly in your bidding strategy, guiding Google to focus on the actions that truly matter.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Leverage Google AI for Better Results:</strong> VBB utilizes Google's powerful machine learning capabilities to analyze vast amounts of data in real-time. This enables the system to make incredibly precise bid adjustments for each auction, considering thousands of signals that humans simply can't process on their own. This leads to more efficient and effective campaign performance.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Improved Return on Ad Spend (ROAS):</strong> By shifting your focus from just counting conversions to optimizing for their assigned monetary value, you are inherently pushing for a higher return on your advertising investment. You want your ad spend to bring in the most profitable customers, and VBB is designed to help achieve that.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Adapt to Customer Journey Nuances:</strong> The car-buying journey is complex, often involving multiple online and offline touchpoints. VBB can understand and value these different interactions along that journey, ensuring you're optimizing for actions that move customers closer to a sale, even if they aren't the final "purchase" conversion.
                    </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    In summary, Value-Based Bidding helps you make your advertising work smarter, ensuring that every dollar spent is directed towards attracting the most valuable customers and maximizing your dealership's profitability in a data-driven way.
                </p>
            </div>
        </div>
    );

    // New component for "Quick Start"
    const QuickStart = () => (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center leading-tight">
                <span className="text-indigo-600">Quick Start</span> to Value-Based Bidding
            </h1>

            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                This calculator is designed to help you quickly and easily get started with Value-Based Bidding (VBB) for your Google Ads campaigns.
            </p>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                    Getting Started in 3 Simple Steps:
                </h2>
                <ul className="list-decimal list-inside text-gray-700 leading-relaxed mb-6 space-y-3 pl-4">
                    <li>
                        <strong className="text-indigo-700">Download Your Conversion Data:</strong> Export your historical conversion data (e.g., weekly sales and event counts) into a CSV file from your analytics platform (like Google Analytics, SA360, or Google Ads).
                    </li>
                    <li>
                        <strong className="text-indigo-700">Drag & Drop into the Calculator:</strong> Simply drag your prepared CSV file and drop it into the designated area on the "VBB Calculator" tab.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Select Your Variables:</strong> Use the dropdowns to map your "Sales Column" and "Conversion Event Columns," and then choose your "Target Average Sale Value," "Daily Google Ads Budget," and "Budget Utilization Percentage." The calculator will instantly provide your optimized conversion values!
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                    Your Path to Smarter Bidding
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    We know that implementing advanced advertising strategies can sometimes feel complex. That's why this tool is built to remove common roadblocks and empower you to adopt Value-Based Bidding without needing to be a data scientist or dive into complex methodologies.
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                    <li>
                        <strong className="text-indigo-700">Define Values with Ease:</strong> Quickly transform your historical conversion data into meaningful monetary values for each of your Google Ads conversion events.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Start Testing VBB Today:</strong> Get the necessary values to begin experimenting with Value-Based Bidding strategies in your ad campaigns, focusing on what truly drives sales for your dealership.
                    </li>
                    <li>
                        <strong className="text-indigo-700">No Complex Methodologies Required:</strong> This tool simplifies the process, using a clear and robust statistical model that’s easy to understand, without overwhelming you with advanced analytics jargon.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Remove Roadblocks to Adoption:</strong> We've created a straightforward, step-by-step process that allows any user to generate actionable insights, breaking down barriers to leveraging VBB.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Easy-to-Use, No-Code Solution:</strong> Just drag and drop your data, make a few selections, and get your results. No coding or complex software installations are needed.
                    </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    Our goal is to help you quickly optimize your Google Ads campaigns for maximum sales impact, making smarter bidding accessible to everyone. Get started now and unlock the full potential of your advertising budget!
                </p>
            </div>
        </div>
    );

    // New component for "Measurement" tab
    const Measurement = () => (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center leading-tight">
                <span className="text-indigo-600">Measuring Success</span> with Value-Based Bidding
            </h1>

            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Validate the impact of Value-Based Bidding through a systematic framework of testing and learning.
            </p>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                    The Importance of Measurement
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Implementing Value-Based Bidding (VBB) with the values from this calculator is a significant step, but it's just the beginning. To truly understand its impact and continually improve performance, you need a robust **measurement framework**. This ensures you're driving **incremental sales** and, by proxy, **more revenue** for your dealership. It's about building a continuous cycle of testing, learning, and optimizing.
                </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                    Starting Your Measurement Journey
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Before you dive deep, establish a clear baseline and methodology:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                    <li>
                        <strong className="text-indigo-700">Set a Clear Objective:</strong> What do you want VBB to achieve? Is it higher total conversion value, increased ROAS, more qualified leads that convert to sales, or a combination? Define specific, measurable goals.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Baseline Performance:</strong> Document your current performance metrics (total sales, lead volume, ROAS, cost per sale, etc.) for the campaigns you plan to apply VBB to. This will be your comparison point.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Utilize Google Ads Experiments:</strong> Google Ads' "Experiments" feature (formerly Drafts & Experiments) is your best friend here. It allows you to run a side-by-side comparison of your current bidding strategy against your new VBB strategy, isolating the impact of the change. Aim for a test duration of at least 4-6 weeks to capture sufficient data and account for conversion delays.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Ensure Sufficient Data Volume:</strong> Smart Bidding works best with data. Ensure your campaigns are generating enough conversions (ideally 15-30 sales-related conversions per month for the primary conversion action) for Google's AI to learn effectively.
                    </li>
                </ul>
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="mb-10">
                <h2 className="2xl font-semibold text-indigo-800 mb-4">
                    Key Performance Indicators (KPIs) to Monitor
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Beyond just conversions, focus on metrics that reflect the value driven:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                    <li>
                        <strong className="text-indigo-700">Total Conversion Value:</strong> This is paramount. Look for an increase in the sum of all conversion values, which directly reflects more valuable outcomes.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Return on Ad Spend (ROAS):</strong> (Total Conversion Value / Ad Spend) * 100%. A higher ROAS indicates your campaigns are becoming more efficient at generating value for every dollar spent.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Sales Volume & Revenue:</strong> Ultimately, are you selling more cars and generating more revenue? This is the true measure of success. Track both the number of sales and the revenue generated.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Cost Per Acquisition (CPA) of High-Value Conversions:</strong> Monitor the cost to acquire your most valuable conversions (e.g., test drives, direct sales leads). While total value is key, keeping an eye on efficiency helps ensure sustainability.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Conversion Rate by Value Tier:</strong> Analyze if your conversion rate for higher-value actions is improving.
                    </li>
                </ul>
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="mb-10">
                <h2 className="2xl font-semibold text-indigo-800 mb-4">
                    How to Test and Iterate
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Testing is crucial to confirm your VBB values are working and to find opportunities for further improvement:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                    <li>
                        <strong className="text-indigo-700">A/B Testing with Google Ads Experiments:</strong>
                        <ul className="list-circle list-inside ml-5 mt-1 space-y-1">
                            <li>Set up an experiment where your **Control group** uses your current bidding (e.g., Target CPA or Maximize Conversions without value).</li>
                            <li>Your **Experiment group** uses "Maximize Conversion Value" with the values generated by this calculator.</li>
                            <li>Run the experiment until statistical significance is reached (Google Ads will indicate this).</li>
                            <li>Analyze which group drove more total conversion value and a better ROAS.</li>
                        </ul>
                    </li>
                    <li>
                        <strong className="text-indigo-700">Refine Values:</strong> Based on test results and ongoing performance, rerun the calculator with updated sales and conversion data. Your sales trends and conversion correlations might shift over time, requiring new values.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Adjust Budget Utilization:</strong> Experiment with different "Budget Utilization Percentages" in the calculator to see what balance yields the best overall value and conversion volume within your daily budget.
                    </li>
                    <li>
                        <strong className="text-indigo-700">Introduce New Conversion Events:</strong> As you identify new valuable actions on your website, incorporate them into your data for the calculator.
                    </li>
                </ul>
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="mb-10">
                <h2 className="2xl font-semibold text-indigo-800 mb-4">
                    The Iterative Process: Not a One-Time Task
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Implementing Value-Based Bidding is not a "set it and forget it" endeavor. The automotive market, consumer behavior, and your dealership's own performance are constantly evolving.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                    To continually drive more **incremental sales** and **revenue**, this process should be repeated on a **regular cadence**:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-3">
                    <li>**Quarterly Review:** A good starting point for re-evaluating your conversion values is quarterly, especially if you see significant shifts in sales patterns or introduce new website features.</li>
                    <li>**Monthly Check-ins:** For highly dynamic markets or campaigns, a monthly review of top-level KPIs might be beneficial.</li>
                    <li>**Post-Campaign Analysis:** After major promotions or seasonal shifts, re-analyze your data and adjust values accordingly.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    By consistently testing, measuring, and refining your VBB values, you'll ensure your Google Ads campaigns are always optimized to deliver the highest possible value and contribute directly to your dealership's growth.
                </p>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
            <div className="w-full max-w-4xl">
                {/* Tabs for Navigation */}
                <div className="mb-6 flex justify-center space-x-2 sm:space-x-4">
                    <button
                        onClick={() => setCurrentPage('quickStart')}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-colors duration-200 ease-in-out
                            ${currentPage === 'quickStart' ? 'bg-white text-indigo-700 shadow-md border-b-2 border-indigo-500' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'}`
                        }
                    >
                        Quick Start
                    </button>
                    <button
                        onClick={() => setCurrentPage('calculator')}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-colors duration-200 ease-in-out
                            ${currentPage === 'calculator' ? 'bg-white text-indigo-700 shadow-md border-b-2 border-indigo-500' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'}`
                        }
                    >
                        VBB Calculator
                    </button>
                    <button
                        onClick={() => setCurrentPage('methodology')}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-colors duration-200 ease-in-out
                            ${currentPage === 'methodology' ? 'bg-white text-indigo-700 shadow-md border-b-2 border-indigo-500' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'}`
                        }
                    >
                        VBB Methodology
                    </button>
                    <button
                        onClick={() => setCurrentPage('whyVbb')}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-colors duration-200 ease-in-out
                            ${currentPage === 'whyVbb' ? 'bg-white text-indigo-700 shadow-md border-b-2 border-indigo-500' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'}`
                        }
                    >
                        Why Value Based Bidding
                    </button>
                    <button
                        onClick={() => setCurrentPage('measurement')}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-colors duration-200 ease-in-out
                            ${currentPage === 'measurement' ? 'bg-white text-indigo-700 shadow-md border-b-2 border-indigo-500' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'}`
                        }
                    >
                        Measurement
                    </button>
                </div>

                {/* Conditional Rendering of Pages */}
                {currentPage === 'quickStart' && <QuickStart />}
                {currentPage === 'calculator' && (
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full border border-gray-200">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center leading-tight">
                            <span className="text-indigo-600">Value-Based Bidding</span> Calculator
                        </h1>

                        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                            Upload your weekly conversion data (CSV), select your 'Sales Column' and 'Conversion Event Columns', and set your target average sale value to calculate optimal conversion values for Google Ads.
                        </p>

                        {/* File Upload / Drag & Drop Area */}
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ease-in-out hover:border-indigo-500 hover:bg-indigo-50 mb-4"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6H16a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2v-3m-1-4l.894-.894A2 2 0 018 10.106V15m0 0l-2.894.894A2 2 0 015 16.894V19a2 2 0 002 2h10a2 2 0 002-2v-3" />
                            </svg>
                            <p className="mt-4 text-sm text-gray-600">
                                <span className="font-semibold text-indigo-700">Drag and drop your CSV here</span> or click to upload
                            </p>
                            {fileName && <p className="mt-2 text-sm text-gray-500">Selected file: <span className="font-medium text-gray-700">{fileName}</span></p>}
                        </div>
                        {/* Download Sample Data Links */}
                        <div className="text-center mb-8 flex justify-center space-x-4">
                            <a
                                href={sampleCsvDataUri}
                                download="vbb_sample_data.csv"
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline transition-colors duration-200"
                            >
                                Download vbb_sample_data.csv
                            </a>
                            <a
                                href={sampleFeatureEngineeringCsvDataUri}
                                download="vbb_sample_feature_engineering.csv"
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline transition-colors duration-200"
                            >
                                Download vbb_sample_feature_engineering.csv
                            </a>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                                <strong className="font-bold">Error! </strong>
                                <span className="block sm:inline">{errorMessage}</span>
                            </div>
                        )}

                        {isParsing && (
                            <div className="flex items-center justify-center mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="ml-3 text-indigo-700">Processing CSV...</p>
                            </div>
                        )}

                        {/* Column Selection Section - Appears after CSV upload */}
                        {csvHeaders.length > 0 && csvData.length > 0 && (
                            <div className="bg-indigo-50 p-6 rounded-lg shadow-inner border border-indigo-200 mb-8">
                                <h2 className="text-xl font-semibold text-indigo-800 mb-4 text-center">
                                    Map Your CSV Columns
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Target Column Select */}
                                    <ColumnSelect
                                        label="Target Column (e.g., Weekly_Sales)"
                                        value={salesColumn}
                                        onChange={setSalesColumn}
                                        options={csvHeaders} // csvHeaders already filtered for date columns
                                    />

                                    {/* Conversion Event Columns Checkboxes */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Conversion Event Columns (Select all that apply):
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {csvHeaders.map(header => {
                                                // isDisabled if it's the selected sales column OR if it's a constant column OR if it has outliers OR if it has high VIF
                                                const isDisabled = header === salesColumn || constantColumns.includes(header) || outlierColumns.includes(header) || vifFlaggedColumns.includes(header);
                                                const tooltipText = isDisabled
                                                    ? (header === salesColumn
                                                        ? "Cannot be a conversion event if also selected as Target column."
                                                        : constantColumns.includes(header)
                                                            ? "Constant values: This column has no variance and cannot be used in the model."
                                                            : outlierColumns.includes(header)
                                                                ? "Outliers detected: This variable contains extreme values that can significantly skew regression results. Consider cleaning your data or using robust regression methods."
                                                                : vifFlaggedColumns.includes(header)
                                                                    ? "High multicollinearity (VIF &gt; 5): This variable is highly correlated with other potential predictors, which can make the model unstable or difficult to interpret."
                                                                    : "")
                                                    : "";

                                                return (
                                                    <div key={header} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`event-col-${header}`}
                                                            checked={eventColumns.includes(header)}
                                                            onChange={() => handleEventColumnChange(header)}
                                                            disabled={isDisabled}
                                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />
                                                        <label htmlFor={`event-col-${header}`} className={`ml-2 text-sm text-gray-700 cursor-pointer ${isDisabled ? 'text-gray-400' : ''}`}>
                                                            {header}
                                                        </label>
                                                        {isDisabled && (
                                                            <span
                                                                className="ml-1 text-gray-500 cursor-help"
                                                                title={tooltipText}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block align-text-bottom">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {eventColumns.length === 0 && salesColumn && (
                                            <p className="text-red-600 text-sm mt-4 text-center">
                                                Please select at least one Conversion Event Column.
                                            </p>
                                        )}
                                        {multicollinearityWarnings.length > 0 && (
                                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4" role="alert">
                                                <p className="font-bold">Potential Issue Detected!</p>
                                                <ul className="mt-2 text-sm list-disc list-inside">
                                                    {multicollinearityWarnings.map((warning, index) => (
                                                        <li key={index}>{warning}</li>
                                                    ))}
                                                </ul>
                                                <p className="mt-2 text-sm">
                                                    Consider deselecting one of the highly correlated variables to ensure model stability and accurate interpretation of coefficients.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Transformation Suggestion */}
                        {showTransformSuggestion && salesColumn && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 rounded-lg" role="alert">
                                <p className="font-bold mb-2">💡 Transformation Suggested for '{salesColumn}'</p>
                                <p className="text-sm mb-3">
                                    Your selected target column appears to have **highly skewed data**. For linear regression, transforming skewed data (e.g., using a logarithmic scale) can often improve model fit, reduce the impact of outliers, and lead to more reliable coefficients.
                                </p>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="logTransformToggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="logTransformToggle"
                                                className="sr-only"
                                                checked={isLogTransformed}
                                                onChange={() => setIsLogTransformed(!isLogTransformed)}
                                            />
                                            <div className={`block bg-gray-600 w-14 h-8 rounded-full ${isLogTransformed ? 'bg-indigo-600' : 'bg-gray-400'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isLogTransformed ? 'translate-x-full' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-sm font-medium text-blue-800">
                                            {isLogTransformed ? 'Transformation ON (log(1+x))' : 'Apply Log Transformation (log(1+x))'}
                                        </div>
                                    </label>
                                    <p className="text-xs text-blue-600 italic">Toggle to apply and re-run model</p>
                                </div>
                            </div>
                        )}

                        {/* Sale Value Selection */}
                        <div className="mb-6">
                            <label htmlFor="saleValue" className="block text-lg font-medium text-gray-700 mb-3">
                                Select Target Average Sale Value:
                            </label>
                            <div className="relative">
                                <select
                                    id="saleValue"
                                    value={selectedSaleValue}
                                    onChange={(e) => setSelectedSaleValue(Number(e.target.value))}
                                    className="block w-full pl-4 pr-10 py-3 text-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg rounded-md shadow-sm appearance-none cursor-pointer bg-white"
                                >
                                    {saleValueOptions.map(value => (
                                        <option key={value} value={value}>
                                            ${value.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Budget Selection */}
                        <div className="mb-6">
                            <label htmlFor="budget" className="block text-lg font-medium text-gray-700 mb-3">
                                Select Daily Google Ads Budget:
                            </label>
                            <div className="relative">
                                <select
                                    id="budget"
                                    value={selectedBudget}
                                    onChange={(e) => setSelectedBudget(Number(e.target.value))}
                                    className="block w-full pl-4 pr-10 py-3 text-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg rounded-md shadow-sm appearance-none cursor-pointer bg-white"
                                >
                                    {budgetOptions.map(value => (
                                        <option key={value} value={value}>
                                            ${value.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Budget Utilization Percentage Selection */}
                        <div className="mb-8">
                            <label htmlFor="budgetUtilization" className="block text-lg font-medium text-gray-700 mb-3">
                                Budget Utilization Percentage (Highest Conversion Value as % of Budget):
                            </label>
                            <div className="relative">
                                <select
                                    id="budgetUtilization"
                                    value={selectedBudgetUtilization}
                                    onChange={(e) => setSelectedBudgetUtilization(Number(e.target.value))}
                                    className="block w-full pl-4 pr-10 py-3 text-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg rounded-md shadow-sm appearance-none cursor-pointer bg-white"
                                >
                                    {budgetUtilizationOptions.map(value => (
                                        <option key={value} value={value}>
                                            {value}%
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Calculated Conversion Values Table */}
                        {calculatedValues.length > 0 && (
                            <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">
                                    Calculated Google Ads Conversion Values
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                                                    Event Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Likelihood to Sale (Coefficient)
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Google Ads Conversion Value (Unscaled)
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                                                    Google Ads Conversion Value (Scaled to Budget)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {calculatedValues.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                        {item.eventName.replace(/_/g, ' ')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {item.probability.toFixed(4)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        ${item.unscaledCalculatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        ${item.scaledCalculatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-6 text-sm text-gray-600 text-center">
                                    These values are recommended based on the selected sale value and the linear relationship between your historical event occurrences and sales. A higher "Likelihood to Sale (Coefficient)" indicates a stronger correlation with sales. Values in the "Scaled to Budget" column have been adjusted to be realistic within your selected daily budget and the chosen budget utilization percentage.
                                </p>
                            </div>
                        )}

                        {csvData.length === 0 && !isParsing && !errorMessage && (
                            <p className="text-center text-gray-500 mt-8">
                                Upload a CSV file to begin calculating conversion values.
                            </p>
                        )}
                        {!isPapaParseLoaded && !errorMessage && (
                            <p className="text-center text-indigo-700 mt-4">
                                Loading CSV parsing library...
                            </p>
                        )}

                        {/* Reset Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={resetState}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ease-in-out"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.243 5.757a1 1 0 00-1.414 0L10 8.586 7.172 5.757a1 1 0 00-1.414 1.414L8.586 10l-2.828 2.828a1 1 0 101.414 1.414L10 11.414l2.828 2.828a1 1 0 001.414-1.414L11.414 10l2.829-2.828a1 1 0 000-1.415z" clipRule="evenodd" />
                                </svg>
                                Reset Calculator
                            </button>
                        </div>
                    </div>
                )}

                {currentPage === 'methodology' && <VbbMethodology />}
                {currentPage === 'whyVbb' && <WhyVbb />}
                {currentPage === 'measurement' && <Measurement />}
            </div>
        </div>
    );
}

export default App;
