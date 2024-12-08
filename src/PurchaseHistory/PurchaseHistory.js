import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PurchaseHistory.css";
import { IoTrashSharp } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import spinner from './image.svg'
import insight from './insight.png'
function PurchaseHistory() {
  const [purchases, setPurchases] = useState([
    { article: "", quantity: "", date: "", time: "" },
  ]);
  const [errors, setErrors] = useState([]); // Validation errors
  const [missingArticles, setMissingArticles] = useState([]); // Missing articles
  const [loading, setLoading] = useState(false); // Loading spinner state
  const [metrics, setMetrics] = useState(null); // User metrics
  const [facture, setFacture] = useState([]); // Facture details
  const [theRecommondation, setRecommondation] = useState([]); // Facture details
  const [theRecommondation2, setRecommondation2] = useState([]); // Facture details
  const [theRecommondation3, setRecommondation3] = useState([]); // Facture details
  const [resultUser, setResultUser] = useState(''); // Facture details

  // Add a new purchase row
  const addRow = () => {
    setPurchases([...purchases, { article: "", quantity: "", date: "", time: "" }]);
  };

  // Remove a specific purchase row
  const removeRow = (index) => {
    const updatedPurchases = purchases.filter((_, i) => i !== index);
    setPurchases(updatedPurchases);
    setErrors(errors.filter((error) => error.index !== index));
    setMissingArticles(missingArticles.filter((_, i) => i !== index));
  };

  // Handle input changes for each row
  const handleInputChange = (index, field, value) => {
    const updatedPurchases = purchases.map((purchase, i) =>
      i === index ? { ...purchase, [field]: value } : purchase
    );
    setPurchases(updatedPurchases);

    // Remove missing article error if article field is updated
    if (field === "article") {
      setMissingArticles(missingArticles.filter((_, i) => i !== index));
    }

    // Remove other specific validation errors for the field
    setErrors(errors.filter((error) => error.index !== index || error.field !== field));
  };

  // Validate the form inputs
  const validateInputs = () => {
    const newErrors = [];
    const today = new Date().toISOString().split("T")[0];

    purchases.forEach((purchase, index) => {
      if (!purchase.article) newErrors.push({ index, field: "article", message: "Article Name is required." });
      if (!purchase.quantity || purchase.quantity <= 0) {
        newErrors.push({ index, field: "quantity", message: "Quantity must be greater than 0." });
      }
      if (!purchase.date) {
        newErrors.push({ index, field: "date", message: "Date is required." });
      } else if (purchase.date > today) {
        newErrors.push({ index, field: "date", message: "Date cannot be in the future." });
      }
      if (!purchase.time) newErrors.push({ index, field: "time", message: "Time is required." });
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      setMetrics(null); // Clear metrics on validation error
      setFacture([]); // Clear facture details on validation error
      setRecommondation([])
      setRecommondation2([])
      setRecommondation3([])
      setResultUser('')
      return;
    }

    setLoading(true); // Show spinner
    setMetrics(null); // Clear previous metrics
    setFacture([]); // Clear previous facture details
    setRecommondation([])
    setRecommondation2([])
    setRecommondation3([])
    setResultUser('')

    // Prepare data for the API request
    const articles = purchases.map((purchase) => ({
      article: purchase.article,
      quantity: purchase.quantity,
      datetime: `${purchase.date}T${purchase.time}`,
    }));

    try {
      const response = await fetch("https://proj-orcin.vercel.app/api/check-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articles }),
      });

      const data = await response.json();
      console.log(data.success)


        if (data.missing_articles) {
          // Highlight missing articles
          const missingIndices = purchases.map((purchase, index) =>
            data.missing_articles.includes(purchase.article) ? index : null
          ).filter((index) => index !== null);
          setMissingArticles(missingIndices);
        }
        setMetrics(null);
        setFacture([]);
        setRecommondation([])
        setRecommondation2([])
        setRecommondation3([])
        setResultUser('')
      
      console.log(missingArticles)


      // Set metrics and facture details
      if (data.success) {
        setMetrics(data.user_metrics);
        setFacture(data.facture_details);
        setRecommondation(Array.isArray(data.recommendations) ? data.recommendations : []); // Ensure recommendations is an array
        setRecommondation2(Array.isArray(data.recommendations2) ? data.recommendations2 : []); // Ensure recommendations is an array
        setRecommondation3(Array.isArray(data.recommendations3) ? data.recommendations3 : []); // Ensure recommendations is an array
        setResultUser(data.result_user); // Ensure recommendations is an array
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing your request.");
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    <div className="purchase-history-page">
      <div className="container py-5">
        <div className="text-center mb-4">
          <h1 className="display-3 text-light">Purchase History</h1>
        </div>
        <form onSubmit={handleSubmit} className="p-4 rounded shadow">
          {purchases.map((purchase, index) => (
            <div key={index} className="row g-3 align-items-center mb-3">
              <div className="col-md-3">
                <input
                  type="text"
                  placeholder="Article Name"
                  value={purchase.article}
                  onChange={(e) => handleInputChange(index, "article", e.target.value)}
                  className={`form-control ${
                    errors.some((error) => error.index === index && error.field === "article") ||
                    missingArticles.includes(index)
                      ? "is-invalid"
                      : ""
                  }`}
                />
                {errors.some((error) => error.index === index && error.field === "article") && (
                  <div className="invalid-feedback">Article Name is required.</div>
                )}
                {missingArticles.includes(index) && (
                  <div className="invalid-feedback">Article does not exist.</div>
                )}
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={purchase.quantity}
                  onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                  className={`form-control ${
                    errors.some((error) => error.index === index && error.field === "quantity") ? "is-invalid" : ""
                  }`}
                />
                {errors.some((error) => error.index === index && error.field === "quantity") && (
                  <div className="invalid-feedback">Quantity must be greater than 0.</div>
                )}
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  value={purchase.date}
                  onChange={(e) => handleInputChange(index, "date", e.target.value)}
                  className={`form-control ${
                    errors.some((error) => error.index === index && error.field === "date") ? "is-invalid" : ""
                  }`}
                />
                {errors.some((error) => error.index === index && error.field === "date") && (
                  <div className="invalid-feedback">Date cannot be in the future.</div>
                )}
              </div>
              <div className="col-md-2">
                <input
                  type="time"
                  value={purchase.time}
                  onChange={(e) => handleInputChange(index, "time", e.target.value)}
                  className={`form-control ${
                    errors.some((error) => error.index === index && error.field === "time") ? "is-invalid" : ""
                  }`}
                />
                {errors.some((error) => error.index === index && error.field === "time") && (
                  <div className="invalid-feedback">Time is required.</div>
                )}
              </div>
              <div className="col-md-1">
                <IoTrashSharp className="text-danger" size={21} onClick={() => removeRow(index)} />
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-4">
            <IoIosAddCircle onClick={addRow} size={28} className="text-primary" />
            <button type="submit" className="btn btn-primary sub">Submit</button>
          </div>
          <div className="d-flex justify-content-center">{loading && <img src={spinner}  style={{width:'60px',height:'60px'}}  />}</div>
        </form>

        {/* Display Metrics */}
        {metrics && (
          <div className="mt-5 p-4 rounded shadow text-dark nice">
            <h3 className="text-center text-white p-3 mb-2">User Metrics</h3>
            <div className="d-flex justify-content-center">
              <div className="card w-25 mx-2 text-center p-4">
                <div className="text-center mb-3">
                  <IoCalendar className="text-center " size={30} />
                </div>
                <p className="h6">
                  Recency: <br />
                  <p className="h5">{metrics.recency} days</p>
                </p>
              </div>
              <div className="card w-25 mx-2 text-center p-4">
                <div className="text-center mb-3">
                  <GrTransaction className="text-center " size={28} />
                </div>
                <p className="h6">
                  Frequency: <br />
                  <p className="h5">{metrics.frequency} transactions</p>
                </p>
              </div>
              <div className="card w-25 mx-2 text-center p-4">
                <div className="text-center mb-3">
                  <FaMoneyCheckDollar className="text-center " size={28} />
                </div>
                <p className="h6">
                  Monetary: <br />
                  <p className="h5">${metrics.monetary.toFixed(2)}</p>
                </p>
              </div>
            </div>
          </div>
        )}




        {resultUser !='' && ( 

        <div className="mt-5 p-4 rounded shadow text-white nice text-center h5">
          <div className='d-flex justify-content-center mt-1 mb-2' ><img src={insight} style={{width:'60px',height:'60px'}} />
          </div>
        {resultUser}


        </div>)}

        {/* Display Facture Details */}
        {facture.length > 0 && (
          <div className="mt-5 p-4 rounded shadow text-dark nice">
            <h3 className="text-center text-white p-3 mb-2">Facture of History</h3>
            <table className="table table-striped table-dark text-center">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {facture.map((item, index) => (
                  <tr key={index}>
                    <td>{item.article}</td>
                    <td>${item.unit_price}</td>
                    <td>{item.quantity}</td>
                    <td>{item.datetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

{Array.isArray(theRecommondation) && theRecommondation.length > 0 && (
  <div className="mt-5 p-4 rounded shadow text-dark nice">
    <h3 className="text-center text-white p-3 mb-2">Recommended Articles Through Clustering</h3>
<div className=' row p-2 g-4  d-flex justify-content-center text-center mx-2 my-2' style={{ gap: '20px' }}>
{theRecommondation.map((item, index) => (
          <div className=" d-flex justify-content-center col-3 card  my-2 text-center" key={index} style={{height:'100px',minHeight:'100px',maxHeight:'100px'}}>
            <div className='h6'>{item.Description}</div>
            <div className='h6'>${item.UnitPrice.toFixed(2)}</div>
          </div>
        ))}


</div>
  </div>
)}



{Array.isArray(theRecommondation2) && theRecommondation2.length > 0 && (
  <div className="mt-5 p-4 rounded shadow text-dark nice">
    <h3 className="text-center text-white p-3 mb-2">Recommended Articles Through NLP</h3>
<div className=' row p-2 g-4  d-flex justify-content-center text-center mx-2 my-2' style={{ gap: '20px' }}>
{theRecommondation2.map((item, index) => (
          <div className=" d-flex justify-content-center col-3 card  my-2 text-center" key={index} style={{height:'100px',minHeight:'100px',maxHeight:'100px'}}>
            <div className='h6'>{item.description}</div>
            <div className='h6'>${item.price.toFixed(2)}</div>
          </div>
        ))}


</div>
  </div>
)}




{Array.isArray(theRecommondation3) && theRecommondation3.length > 0 && (
  <div className="mt-5 p-4 rounded shadow text-dark nice">
    <h3 className="text-center text-white p-3 mb-2">Recommended Articles Through Trend</h3>
<div className=' row p-2 g-4  d-flex justify-content-center text-center mx-2 my-2' style={{ gap: '20px' }}>
{theRecommondation3.map((item, index) => (
          <div className=" d-flex justify-content-center col-3 card  my-2 text-center" key={index} style={{height:'100px',minHeight:'100px',maxHeight:'100px'}}>
            <div className='h6'>{item.Description}</div>
            <div className='h6'>${item.UnitPrice.toFixed(2)}</div>
          </div>
        ))}


</div>
  </div>
)}


      </div>
    </div>
  );
}

export default PurchaseHistory;
