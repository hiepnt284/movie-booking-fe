import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { message } from "antd";
import postApi from "../api/postApi";
import "./style/TextEditor.css";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize);

const ReactQuillEditor = ({ content, handleChange }) => {
  const [enable, setEnable] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    setEnable(true);
  }, []);

  // Image upload handler for toolbar
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (input !== null && input.files !== null) {
        const file = input.files[0];
        try {
          // Upload image to API
          const response = await postApi.uploadImage(file);
          const imageUrl = response.url;

          // Get editor instance and insert image
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection();
          if (range) {
            editor.insertEmbed(range.index, "image", imageUrl);
          }
        } catch (error) {
          message.error("Failed to upload image");
          console.log(error);
        }
      }
    };
  }, []);

  return (
    <div>
      {enable ? (
        <ReactQuill
          ref={quillRef}
          style={{ height: "400px" }}
          value={content}
          onChange={handleChange}
          theme="snow"
          placeholder="Viết nội dung tại đây..."
          modules={{
            toolbar: {
              container: [
                [
                  { font: [] },
                  { size: [] },
                  { header: [1, 2, 3, 4, 5, 6, false] },
                ],
                [{ align: [] }],
                ["bold", "italic", "underline", "strike", "blockquote", "code"],
                [
                  { list: "ordered" },
                  { list: "bullet" },
                  { indent: "-1" },
                  { indent: "+1" },
                ],
                ["link", "image", "video"],
                [{ color: [] }, { background: [] }],
                ["clean"],
                // [{ image: true }],
                // ['image'],
              ],
              handlers: {
                image: imageHandler,
              },
            },
            clipboard: {
              matchVisual: false,
            },
            imageResize: {
              parchment: Quill.import("parchment"),
              modules: ["Resize", "DisplaySize", "Toolbar"],
            },
          }}
          formats={[
            "font",
            "size",
            "header",
            "bold",
            "italic",
            "underline",
            "strike",
            "blockquote",
            "list",
            "bullet",
            "indent",
            "link",
            "image",
            "video",
            "align",
            "color",
            "background",
          ]}
        />
      ) : null}
      <div style={{padding:"0 200px"}}><ReactQuill value={content} readOnly={true} theme={"bubble"} /></div>
      <div style={{ marginTop: "50px" }}></div>
      {/* <div
        style={{ border: "1px solid #d9d9d9", padding: "5px" }}
        dangerouslySetInnerHTML={{ __html: content }}
      /> */}
      {/* <div>{content}</div> */}
    </div>
  );
};

export default ReactQuillEditor;
