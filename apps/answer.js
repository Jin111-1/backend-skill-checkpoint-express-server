import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

answersRouter.post("/:answerId/vote", async(req,res)=>{
    let result;
    const answerIdFromUsers = req.params.answerId;
    const {vote} = req.body
    if( vote !== 1 && vote !== -1){
        return res.status(400).json({"message": "Invalid vote value."});
    };
    try{
        const answerIdExists = await connectionPool.query(`SELECT * FROM answers WHERE id = $1`,[answerIdFromUsers]);
    if(answerIdExists === 0){
        return res.status(404).json({"message": "Answer not found."});
    };
    result = await connectionPool.query(`
        INSERT INTO answer_votes (answer_id,vote)
        VALUES ($1,$2)
        RETURNING *`,
        [answerIdFromUsers,vote])
    }catch(error){
        return res.status(500).json({"message": "Unable to vote answer."})
    };
    return res.status(200).json({
        message: "Vote on the answers has been recorded successfully.",
        data: result.rows[0]
    });
});

export default answersRouter