import React, { useEffect, useState, useRef } from 'react'
import { map, _ } from 'lodash'
import MetaTags from 'react-meta-tags'
import * as AWS from 'aws-sdk'
import Breadcrumb from '../common/breadcrumb'
import { v4 as uuidv4 } from 'uuid'
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  Input,
  Label,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  ModalHeader,
  ModalBody,
  CardTitle,
  CardHeader,
  Modal,
  FormGroup,
} from 'reactstrap'

import { Editor } from '@tinymce/tinymce-react'

import { gql, useMutation, useQuery } from '@apollo/client'

const UPDATE_SELLING = gql`
  mutation createTermsanduse($contents: String) {
    createTermsanduse(contents: $contents) {
      id
    }
  }
`




const ME_QUERY = gql`
  query me {
    me {
      id
      name
      email
    }
  }
`

const CREACT_PRODUCT_MUTATION = gql`
    mutation createProduct(
        $title: String
        $description: String
        $type: String
        $brand: String
        $category: String
        $price: Int
        $newproduct: String
        $sale: String
        $stock: String
        $discount: Int
        $variants: String
        $images: String
        $userId: Int
		$productpageId: Int
       
    ) {
        createProduct(
        title: $title
        description:$description
        type:$type
        brand: $brand
        category: $category
        price:$price
        newproduct:$newproduct
        sale: $sale
        stock: $stock
        discount: $discount
        variants:$variants
        images: $images
        userId:$userId
		productpageId:$productpageId
         
        ) {
            userId
        }
    }
`

const Create_page = (props) => {
  var node = useRef()
  const [startDate, setStartDate] = useState(new Date())
  const [testarr, settestarr] = useState([])
  const [collectsource, setcollectsource] = useState('not selected')
  const [activeTab, setActiveTab] = useState('0')
  const [contentvalue, setcontentvalue] = useState('')
  const [imageCenterModal, setImageCenterModal] = useState(false)
  const [s3imagesforup, sets3imagesforup] = useState([])
  const [formStateimage, setFormStateimage] = useState([])
  const [status, setstatus] = useState()

  //   const {
  //     loading,
  //     error: error3,
  //     data: medata,
  //   } = useQuery(DATA_QUERY2, {

  //     fetchPolicy: "network-only",
  //     onCompleted: medata => {
  //       if (medata) {
  //         console.log("df", medata.Termsanduses[0]?.contents)
  //         setstatus(medata.Termsanduses[0]?.contents)
  //       }
  //     },
  //     onError: error3 => {
  //       console.log("error!3", error)
  //     },
  //   })

  const [formState, setFormState] = useState({
	  id: 0,
    productImages: [],
	descriptionHTMLContent:"",
    title: '',
    description: '',
    type: '',
    brand: '',
    category: '',
    price: 0,
    newproduct: '',
    sale: '',
    stock: '',
    discount: 0,
    variants: '',
    images: '',
    userId: 0,
    productpageId: 0,
  })
  const [imageCenterFormState, setImageCenterFormState] = useState({
    startDate: null,
    endDate: null,
    page: 1,
    size: 20,
    selectedIds: [],
  })

  const { error, data } = useQuery(ME_QUERY, {
    onCompleted: (data) => {
      console.log('data!3', data.me.id)
	  setFormState({
		...formState,
		id: data.me.id,
	  })

    },
    onError: (error) => {
      console.log('error!3', error)
    },
  })

  const [createsellingmutation, { data2, error2 }] = useMutation(
    UPDATE_SELLING,
    {
      onCompleted: (data2) => {
        window.alert('업데이트 완료')
        window.location.reload()
      },
      onError: (error2) => console.log('error!3', error2),
    },
  )


  const [productCReate] = useMutation(CREACT_PRODUCT_MUTATION, {
	onError: (error5) => {
		console.log("error5", error5);

	
		// window.location.reload();
	},
	onCompleted: (data5) => {
		console.log("data5", data5);
		
	},
});


  const startmutation = () => {
    createsellingmutation({
      variables: {
        contents: formState.descriptionHTMLContent,
      },
    })
  }



  const startcreateproductmutation = () => {
	  console.log("formstate11", formState)
    productCReate({
      variables: {
        title: String(formState.title),
		description: String(formState.descriptionHTMLContent),
		type: "none",
		brand: String(formState.brand),
		category: String(formState.category),
		price: Number(formState.price),
		newproduct: "none",
		sale: String(formState.sale),
		stock: String(formState.stock),
		discount: Number(formState.discount),
		variants: String(formState.variants),
		images:JSON.stringify(s3imagesforup),
		userId: Number(formState.id),
		productpageId: 1,
      },
    })
  }





  useEffect(() => {
	console.log("s3imagesforup",s3imagesforup)
  },[s3imagesforup])



  const config = {
    bucketName: process.env.REACT_APP_S3_BUCKETNAME,
    region: process.env.REACT_APP_S3_BUCKETREGION,
    // accessKeyId: process.env.REACT_S3_ACCESSKEYID,
    accessKeyId: process.env.REACT_APP_S3_ACCESSKEYID,
    secretAccessKey: process.env.REACT_APP_S3_SECRETACCESSKEY,
  }

  const s3 = new AWS.S3({
    region: process.env.REACT_APP_S3_BUCKETNAME,
    accessKeyId: process.env.REACT_APP_S3_ACCESSKEYID,
    secretAccessKey: process.env.REACT_APP_S3_SECRETACCESSKEY,
  })

  const uploadToS3 = async (data) => {
    let name = uuidv4() + '.' + data.type.substring(6)
    console.log('sdfsdf', data.name)
    await s3
      .putObject({
        Key: name,
        Bucket: 'yoyomobucket',
        // ContentType: "image/jpeg",
        ContentType: data.type,
        Body: data,
        ACL: 'public-read',
      })
      .promise()
    return `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${name}`
  }

  const uploadFile = async (e) => {
    console.log('dfsdf', process.env)
    try {
      if (e.target.files.length > 0) {
        for (let i = 0; i < e.target.files.length; i++) {
          // uploadFile1(s3images1[i], s3images1[i]);
          const url = await uploadToS3(e.target.files[i])
          const url2 = await sets3imagesforup((prevImages) =>
            prevImages.concat(url),
          )
          const urlbefore = await [
            {
              fileName: e.target.files[i].name,
              image: url,
              id: uuidv4() + '.' + e.target.files[i].type.substring(6),
            },
          ]
          const url3 = await setFormStateimage((formStateimage) =>
            formStateimage.concat(urlbefore),
          )
          if (e.target.files.length - 1 == i) {
            return
          }
        }
      } else {
        const url = await uploadToS3(e.target.files[0])
        console.log('url', url)
        sets3imagesforup((prevImages) => prevImages.concat(url))
      }

      // const url = await uploadToS3(e.target.files[0])
      // console.log("url", url)
      // sets3imagesforup((prevImages) => prevImages.concat(url));
      // res = ""
    } catch (error) {
      console.log('ee', error)
      window.alert(
        '업로드 도중 오류가 발생하였습니다. 잠시 후 다시 시도 부탁드립니다.',
        error,
      )
    }
  }

  console.log(formState, 'formstart')
  return (
    <React.Fragment>
      <div className="page-content">
        <MetaTags>
          <title>이용약관 편집 </title>
        </MetaTags>
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumb title="제품 업로드" parent="Pages" />
          <Col xs={12}>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span>제품명
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.title}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    title: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 브랜드명
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.brand}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    brand: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 카테고리
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.category}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    category: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 가격
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="number"
                required=""
                value={formState.price}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    price: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 세일여부(네, 아니오)
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.sale}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    sale: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 할인율(아닐시 공란)
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.discount}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    discount: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 재고갯수
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="number"
                required=""
                value={formState.stock}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    stock: e.target.value,
                  })
                }}
              />
            </FormGroup>

            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 상품옵션
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.variants}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    variants: e.target.value,
                  })
                }}
              />
            </FormGroup>
            <FormGroup className="row">
              <Label className="col-xl-3 col-md-4">
                <span>*</span> 상품이미지
              </Label>
              <Input
                className="form-control col-xl-8 col-md-7"
                type="text"
                required=""
                value={formState.images}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    images: e.target.value,
                  })
                }}
              />
            </FormGroup>
          </Col>
          <Col xs={12}>
            <Editor
              apiKey="5w7nppptiaeqbf4id6k3xdeewc84wjk9jdflqfvi0zryhnob"
              value={formState.descriptionHTMLContent}
              onEditorChange={(e) => {
                setFormState({
                  ...formState,
                  descriptionHTMLContent: e,
                })
              }}
              init={{
                placeholder: '정보를 입력해 주세요.',
                height: 700,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                ],
                toolbar:
                  'imageCenterButton  formatselect  ' +
                  'bold italic underline alignleft aligncenter ' +
                  'alignright  bullist numlist  ',

                content_style:
                  'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                setup: (editor) => {
                  editor.ui.registry.addButton('imageCenterButton', {
                    icon: 'image',
                    text: '업로드',
                    onAction: (e) => {
                      setImageCenterFormState({
                        ...imageCenterFormState,
                        position: 'textEdit',
                      })
                      setImageCenterModal(true)
                    },
                  })
                },
              }}
            />
            <Button onClick={() => startcreateproductmutation()}>상품 업로드</Button>
          </Col>
          <Modal isOpen={imageCenterModal}>
            <Card>
              {/* <CardHeader style={{ backgroundColor: "#5e72e4" }}> */}
              <CardHeader>
                <button
                  aria-label="Close"
                  className="close float-right"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => setImageCenterModal(false)}
                >
                  <span className="text-white" aria-hidden>
                    ×
                  </span>
                </button>
              </CardHeader>
              <CardBody>
                <CardTitle className="mb-3">상품 기본 정보</CardTitle>
                <Input
                  className="form-control form-control-lg"
                  id="formFileLg"
                  type="file"
                  name="file"
                  multiple
                  onChange={uploadFile}
                  ref={node}
                />

                <Container fluid>
                  <Row style = {{
					  marginTop:"15px"
				  }}>
                    {formStateimage ? (
                      formStateimage.length > 0 ? (
                        formStateimage.map((imageData, imageIndex) => (
                          <Col sm={4} xs={4} key={imageIndex}>
                            <Card
                              style={
                                imageCenterFormState.selectedIds.includes(
                                  imageData.id,
                                )
                                  ? {
                                      height: 'auto%',
                                      border: 'dotted',
                                      borderColor: 'red',
                                    }
                                  : {
                                      height: 'auto%',
                                      border: 'dotted',
                                      borderColor: 'white',
                                    }
                              }
                              onClick={() => {
                                setImageCenterFormState({
                                  ...imageCenterFormState,
                                  selectedIds: [
                                    ...imageCenterFormState.selectedIds,
                                    imageData.id,
                                  ],
                                })
                              }}
                            >
                              <CardBody
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  display: 'inline-block',
                                  margin: '0 auto',
                                  verticalAlign: 'middle !important',
                                  padding: '0',
                                }}
                              >
                                <img
                                  style={{ width: '100%' }}
                                  src={imageData.image}
                                  alt={imageData.fileName}
                                />
                              </CardBody>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <></>
                      )
                    ) : (
                      <></>
                    )}
                  </Row>
                </Container>
                {/* <h5 className="mt-5">
              {imageCenterFormState.selectedIds.length} 개 선택 됨
            </h5> */}
                {imageCenterFormState.selectedIds.length > 0 ? (
                  <Button
                    className="float-right"
                    color="success"
                    onClick={() => {
                      if (imageCenterFormState.position === 'mainImage') {
                        formStateimage &&
                          setFormState({
                            ...formState,
                            productImages: _.uniq([
                              ...formState.productImages,
                              ...formStateimage
                                .filter((filterData) =>
                                  imageCenterFormState.selectedIds.includes(
                                    filterData.id,
                                  ),
                                )
                                .map((imageData) => imageData.image),
                            ]),
                          })
                        // imageAddSuccess()
                        setImageCenterModal(false)
                        setImageCenterFormState({
                          ...imageCenterFormState,
                          position: null,
                          selectedIds: [],
                        })
                      }

                      if (imageCenterFormState.position === 'textEdit') {
                        const imageList = formStateimage
                          .filter((filterDate) =>
                            imageCenterFormState.selectedIds.includes(
                              filterDate.id,
                            ),
                          )
                          .map((imageDate) => imageDate.image)

                        if (imageList.length > 0) {
                          console.log('imgae', imageList)
                          //   setFormState({
                          //     ...formState,
                          //     descriptionHTML: formState.descriptionHTMLContent
                          //       ? `${formState.descriptionHTMLContent}<img src="${imageList[0]}" />`
                          //       : `<img src="${imageList[0]}" />`,
                          //   })
                          setFormState({
                            ...formState,
                            descriptionHTMLContent:
                              formState.descriptionHTMLContent
                                ? `${formState.descriptionHTMLContent}<img src=${imageList[0]} />`
                                : `<img src=${imageList[0]} />`,
                          })

                          // setFormState({
                          // 	...formState,
                          // 	descriptionHTMLContent: `${formState.descriptionHTMLContent}`

                          //   })
                        }
                      }
                    }}
                  >
                    추가하기
                  </Button>
                ) : (
                  <></>
                )}
              </CardBody>
            </Card>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default Create_page
