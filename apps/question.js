
import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();



questionRouter.get("/", async (req,res)=>{
    let result ;
    try{
        result = await connectionPool.query(`select * from questions`);
    } catch(error) {
        return res.status(500).json({
            "message": "Unable to fetch questions.",
            error:error.message,
        });
    };
    return res.status(200).json({
        data:result.rows
    })
});



questionRouter.get("/search",async(req,res)=>{
    const keyword = req.query.keyword || "";
    const search = `%${keyword}%`;
    let result;

    try{
        result = await connectionPool.query(`  
            SELECT * FROM questions 
            WHERE title ILIKE $1 
            OR category ILIKE $1`,[search]);
    
    
     if (result.rowCount === 0) {
        return res.status(404).json({ error: "Question not found" });
    };

    }catch(error){
        return res.status(500).json( 
            {"message": "Unable to fetch questions.",
                error:error.message,
            });
    };
    return res.status(200).json({
        data:result.rows
    });
});



questionRouter.get("/:questionId" , async (req,res)=>{
    let result;
    const questionIdFromClient = req.params.questionId
    try{
        result = await connectionPool.query(`select * from questions where id = $1 limit 1`,[questionIdFromClient]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Question not found" });
    }

    }catch(error){
        return res.status(500).json( 
            {"message": "Unable to fetch questions.",
                error:error.message,
            });
    };
    return res.status(200).json({
        data:result.rows[0]
    });
});



questionRouter.get("/:questionId/answers",async (req,res)=>{
    let result;
    const questionIdFromClient = req.params.questionId;
    
    try{
        result = await connectionPool.query(`select * from answers where question_id = $1 `,[questionIdFromClient]);

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Question not found" });
    };

    }catch(error){
        return res.status(500).json({"message": "Unable to fetch answers.",
            error:error.message
        })
    };

    return res.status(200).json({
        data:result.rows[0]
    });
});



questionRouter.post("/",async (req,res)=>{
    let result;
    const {title,description,category} = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ 
            message: "Invalid request data."
        });
    };

    try {
         result = await connectionPool.query(
            `INSERT INTO questions (title, description, category)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, description, category]
        );

    }catch(error){
        return res.status(500).json({"message": "Unable to create question.",
            error:error.message
        });
    };
    return res.status(200).json({
        data:result.rows[0]
    });
});



questionRouter.put("/:questionId", async(req,res)=>{
    let result;
    const questionIdFromClient = req.params.questionId;
    const {title,description,category} = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ 
            message: "Invalid request data."
        });
    };

    try{
        result = await connectionPool.query(
        `UPDATE questions 
        SET title = $1, description = $2, category = $3 
        WHERE id = $4 
        RETURNING *`,
       [title, description, category, questionIdFromClient]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Question not found" });
    };

    return res.status(200).json({
        data: result.rows[0]
    });

    }catch(error){
        return res.status(500).json({"message": "Unable to fetch question.",
            error:error.message
        });
    };     
});



questionRouter.post("/:questionId/vote", async (req, res) => {
    const questionIdFromClient = req.params.questionId;
    const { vote } = req.body;

    if (vote !== -1 && vote !== 1) {
        return res.status(400).json({ message: "Invalid vote value." });
    }

    try {
        const questionExists = await connectionPool.query(
            `SELECT 1 FROM questions WHERE id = $1`,
            [questionIdFromClient]
        );

        if (questionExists.rowCount === 0) {
            return res.status(404).json({ "message": "Question not found." });
        }

        const result = await connectionPool.query(
            `INSERT INTO question_votes (question_id, vote)
             VALUES ($1, $2)
             RETURNING *`,
            [questionIdFromClient, vote]
        );

        return res.status(200).json({
            message: "Vote on the question has been recorded successfully.",
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            message: "Unable to vote on question.",
            error: error.message
        });
    };
});



questionRouter.delete("/:questionId",async(req,res)=>{
    let result;
    const questionIdFromClient = req.params.questionId;
    try{
        result = await connectionPool.query(
            `DELETE FROM questions WHERE id = $1`,
            [questionIdFromClient]
        );
    if(result.rowCount === 0){
        return res.status(404).json({"message": "Question not found."})
    };
    }catch(error){
        return res.status(500).json({"message": "Unable to delete question."})
    };
    return res.status(200).json({  "message": "Question post has been deleted successfully."
    });
});


questionRouter.delete("/:questionId/answers",async (req,res)=>{
    let result;
    let questionIdFromClient = req.params.questionId;
    try{
        const questionExists = await connectionPool.query(
            `SELECT 1 FROM questions WHERE id = $1`,
            [questionIdFromClient]
        );
        if (questionExists.rowCount === 0) {
            return res.status(404).json({ "message": "Question not found." });
        };
        result  = await connectionPool.query(
            `DELETE FROM answers WHERE question_id = $1 `,[questionIdFromClient]
        );
    }catch(error){
        return res.status(500).json({"message": "Unable to delete votes.",error:error.message})
    };
    return res.status(200).json({ "message": "All answers for the question have been deleted successfully."
    });
});
export default questionRouter

