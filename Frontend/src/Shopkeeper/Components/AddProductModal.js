import React, { useState } from 'react'

const AddProductModal = (props) => {
    const add=async(e)=>{
      try {
        e.preventDefault()
        const response= await fetch("http://localhost:3010/api/addproduct",{
         method:"post",
         body:JSON.stringify,
         headers:{
             "Content-Type":"application/json",
         }
        })
      } catch (error) {
        
      }
    }
    return (
        <div>
            <div class="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{display:"block"}} id="addpaymentModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0">
                        <div className="modal-header p-4 pb-0">
                            <h5 className="modal-title" id="createMemberLabel">Add Product</h5>
                            <button type="button" onClick={()=>props.setToggle(false)}  className="btn-close" id="createMemberBtn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body p-4">
                            <form>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Product Name</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Product Model</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter model" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Product Company</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter company" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="paymentdetails" className="form-label">Product Description</label>
                                            <textarea className="form-control" placeholder="Enter Product Description" id="paymentdetails" defaultValue={""} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Product price</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter Price" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="amount" className="form-label">Rate</label>
                                            <input type="number" className="form-control" id="amount" placeholder="Enter rate" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label"> Tax</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter tax" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Discount</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter discount" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Product Stock</label>
                                            <input type="text" className="form-control" id="Name" placeholder="Enter stock" />
                                        </div>
                                        <div className="hstack gap-2 justify-content-end">
                                            <button type="button" className="btn btn-light" onClick={()=>props.setToggle(false)} >Close</button>
                                            <button onClick={add} type="submit" className="btn btn-success" id="addNewMember">Add Customer</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddProductModal