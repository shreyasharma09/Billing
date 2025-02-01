import React ,{useRef} from 'react'
import Title from '../../CommonComponents/Title'
import Footer from '../../CommonComponents/Footer'
import * as xlsx from "xlsx"          //globally fn ko import krne ke lie * use krnge
const AddExcelData = ({fun}) => {      //props
  const file=useRef()
  const upload=(event)=>{
    const filedata=event.target.files[0]
    if(!filedata) return alert("Please Upload Excel File")
    if(filedata.type!=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return alert("Only Excel File is allowed")
    //filedata m excel data tha, fileReader se data ko read krnge as arraybuffer(excel),tym lega to onload lgaynge,xlsx ko install krke uska read fn call krnge or workbook name ke obj m rkh lenge,workbook m key =Sheetname(no of sheets),Sheets(data in sheets)
    const reader=new FileReader()
    reader.readAsArrayBuffer(filedata)                         // excel file ko read krne ke lie arraybuffer
    reader.onload=function () {                                // time lera h to onload use kia
      const workbook= xlsx.read(reader.result, {type:'buffer'})//reader obj m result name ki key thi 
      const worksheetName=workbook.SheetNames[0]               //like sheet 1(ye 0th index pe hogi) ,sheet 2 
      const worksheet=workbook.Sheets[worksheetName]           //data in each sheets
      const array=xlsx.utils.sheet_to_json(worksheet)          //data bikhra hua hoga we use 
      //data addexcel ke page se dlvaynge bt show review ke page se krnge so have to pass data (props)
      fun(array)
    }
  }
  return (
    <div className="main-content">
  <div className="page-content">
    <div className="container-fluid">
      <Title Name={"New Product"} />
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body">
              <div className="p-2">
                <form>
                    <div className="dropzone mb-3">
                      <div className="fallback">
                        <input ref={file} onChange={upload} name="file" type="file" multiple="multiple" hidden />
                      </div>
                      <div onClick={()=>file.current.click()} style={{textAlign:"center"}} className="dz-message needsclick">
                        <div className="mb-3">
                          <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                        </div>
                        <h4>Drop files here or click to upload.</h4>
                      </div>
                    </div>
                    <ul className="list-unstyled" id="dropzone-preview">
                      <li className="mt-2" id="dropzone-preview-list">
                        <div className="border rounded">
                          <div className="d-flex p-2">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar-sm bg-light rounded">
                                <img data-dz-thumbnail className="img-fluid rounded d-block" src="assets/images/new-document.png"  />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="pt-1">
                                <h5 className="fs-14 mb-1" data-dz-name>&nbsp;</h5>
                                <p className="fs-13 text-muted mb-0" data-dz-size />
                                <strong className="error text-danger" data-dz-errormessage />
                              </div>
                            </div>
                            <div className="flex-shrink-0 ms-3">
                              <button data-dz-remove className="btn btn-sm btn-danger">Delete</button>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                </form>
                <div className="hstack gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-light">Discard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer/>
</div>  
)}

export default AddExcelData